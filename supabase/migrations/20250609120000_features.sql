-- Extensions fonctionnelles (hors emails)

-- Salles : équipements, salles liées (ex. Diamant & Onyx bloque Diamant + Onyx)
alter table public.rooms
  add column if not exists equipment text[] not null default '{}',
  add column if not exists linked_room_ids uuid[] not null default '{}',
  add column if not exists requires_second_approval boolean not null default false,
  add column if not exists floor_label text,
  add column if not exists plan_zone text;

-- Demandes : récurrence, validation multi-niveaux
alter table public.reservation_requests
  add column if not exists recurrence_rule jsonb,
  add column if not exists parent_request_id uuid references public.reservation_requests (id) on delete set null,
  add column if not exists approval_step integer not null default 1,
  add column if not exists required_approval_steps integer not null default 1;

-- Commentaires sur les demandes
create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.reservation_requests (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Pièces jointes (métadonnées — fichiers dans Storage bucket "attachments")
create table if not exists public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.reservation_requests (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  size_bytes integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_request_comments_request_id on public.request_comments (request_id);
create index if not exists idx_request_attachments_request_id on public.request_attachments (request_id);
create index if not exists idx_reservation_requests_dates_status on public.reservation_requests (room_id, start_at, end_at, status);

-- Détection de conflits (demandes approuvées ou en attente)
create or replace function public.get_conflicting_room_ids(
  p_room_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_exclude_request_id uuid default null
)
returns uuid[]
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_room_ids uuid[];
begin
  select coalesce(linked_room_ids, '{}') || array[p_room_id]
  into v_room_ids
  from public.rooms
  where id = p_room_id;

  select array_agg(distinct r.room_id)
  into v_room_ids
  from (
    select unnest(v_room_ids) as room_id
    union
    select rr.room_id
    from public.reservation_requests rr
    join public.rooms rm on rm.id = rr.room_id
    where rr.status in ('pending', 'approved')
      and p_room_id = any(rm.linked_room_ids)
      and (p_exclude_request_id is null or rr.id <> p_exclude_request_id)
    union
    select unnest(rm.linked_room_ids)
    from public.rooms rm
    where rm.id = p_room_id and cardinality(rm.linked_room_ids) > 0
  ) r;

  return coalesce(v_room_ids, array[p_room_id]);
end;
$$;

create or replace function public.has_booking_conflict(
  p_room_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_exclude_request_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1
    from public.reservation_requests rr
    where rr.room_id = any(public.get_conflicting_room_ids(p_room_id, p_start_at, p_end_at, p_exclude_request_id))
      and rr.status in ('pending', 'approved')
      and (p_exclude_request_id is null or rr.id <> p_exclude_request_id)
      and rr.start_at < p_end_at
      and rr.end_at > p_start_at
  );
end;
$$;

-- RLS commentaires & pièces jointes
alter table public.request_comments enable row level security;
alter table public.request_attachments enable row level security;

create policy "Users can read comments on visible requests"
  on public.request_comments for select
  to authenticated
  using (
    exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_comments.request_id
        and (
          rr.requester_id = auth.uid()
          or public.current_user_role() in ('service_manager', 'admin')
        )
    )
  );

create policy "Users can add comments on visible requests"
  on public.request_comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_comments.request_id
        and (
          rr.requester_id = auth.uid()
          or public.current_user_role() in ('service_manager', 'admin')
        )
    )
  );

create policy "Users can read attachments on visible requests"
  on public.request_attachments for select
  to authenticated
  using (
    exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_attachments.request_id
        and (
          rr.requester_id = auth.uid()
          or public.current_user_role() in ('service_manager', 'admin')
        )
    )
  );

create policy "Users can upload attachments on own requests"
  on public.request_attachments for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_attachments.request_id
        and rr.requester_id = auth.uid()
    )
  );

-- Admins : gestion profils
create policy "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.current_user_role() = 'admin');

create policy "Admins can update app settings"
  on public.app_settings for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Storage bucket attachments (exécuter si bucket créé manuellement ou via dashboard)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own attachment files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'attachments');

-- Données : équipements, salles liées, validation 2 niveaux auditorium
update public.rooms set
  equipment = array['Vidéoprojecteur', 'Sonorisation', 'PMR'],
  requires_second_approval = true,
  floor_label = 'R+1',
  plan_zone = 'auditorium'
where slug = 'auditorium';

update public.rooms set
  equipment = array['Vidéoprojecteur', 'Sonorisation', 'Scène'],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-ouest'
where slug in ('diamant', 'onyx');

update public.rooms set
  equipment = array['Vidéoprojecteur', 'Sonorisation', 'Scène', 'Modulable'],
  linked_room_ids = (
    select array_agg(id) from public.rooms where slug in ('diamant', 'onyx')
  ),
  floor_label = 'R+1',
  plan_zone = 'polyvalente-ouest'
where slug = 'diamant-onyx';

update public.rooms set
  equipment = array['Vidéoprojecteur', 'Tables modulables'],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-est'
where slug in ('sardoine', 'saphir', 'topaze', 'or');

update public.rooms set
  equipment = array['Écran TV', 'Visioconférence'],
  floor_label = 'R+1',
  plan_zone = 'salons'
where slug in ('emeraude', 'escarboucle', 'sardonyx', 'sardius');

update public.rooms set
  equipment = array['Caméras', 'Régie', 'Fond vert'],
  floor_label = 'RDC',
  plan_zone = 'studios'
where room_type = 'studio';

update public.rooms set
  equipment = array['Jeux', 'Tables enfants'],
  floor_label = 'RDC',
  plan_zone = 'enfants'
where room_type = 'espace_enfants';
