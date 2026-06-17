-- Historique, périodes bloquées, comptes actifs, domaines email autorisés

alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- Historique des modifications de demandes
create table if not exists public.request_change_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.reservation_requests (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('created', 'updated', 'cancelled')),
  changes jsonb not null default '{}'::jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_request_change_log_request_id
  on public.request_change_log (request_id, created_at desc);

-- Périodes bloquées (maintenance, fermetures, événements fixes)
create table if not exists public.room_blackouts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  title text not null,
  reason text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  recurrence_frequency text not null default 'none'
    check (recurrence_frequency in ('none', 'weekly')),
  recurrence_until timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint room_blackouts_valid_range check (end_at > start_at)
);

create index if not exists idx_room_blackouts_room_dates
  on public.room_blackouts (room_id, start_at, end_at);

-- Domaines email autorisés (vide = tous autorisés)
insert into public.app_settings (key, value)
values ('email_domains', '{"domains": []}'::jsonb)
on conflict (key) do nothing;

-- RLS historique
alter table public.request_change_log enable row level security;

create policy "Users can read change log on visible requests"
  on public.request_change_log for select
  to authenticated
  using (
    exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_change_log.request_id
        and (
          rr.requester_id = auth.uid()
          or public.current_user_role() in ('service_manager', 'admin')
        )
    )
  );

create policy "Users can insert change log on own pending requests"
  on public.request_change_log for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and exists (
      select 1 from public.reservation_requests rr
      where rr.id = request_change_log.request_id
        and (
          (rr.requester_id = auth.uid() and rr.status = 'pending')
          or public.current_user_role() in ('service_manager', 'admin')
        )
    )
  );

-- RLS périodes bloquées
alter table public.room_blackouts enable row level security;

create policy "Authenticated users can read blackouts"
  on public.room_blackouts for select
  to authenticated
  using (true);

create policy "Admins can manage blackouts"
  on public.room_blackouts for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Service managers can manage blackouts for their rooms"
  on public.room_blackouts for insert
  to authenticated
  with check (
    public.current_user_role() = 'service_manager'
    and exists (
      select 1 from public.rooms r
      where r.id = room_blackouts.room_id
        and r.service_id = public.current_user_service_id()
    )
  );

create policy "Service managers can update blackouts for their rooms"
  on public.room_blackouts for update
  to authenticated
  using (
    public.current_user_role() = 'service_manager'
    and exists (
      select 1 from public.rooms r
      where r.id = room_blackouts.room_id
        and r.service_id = public.current_user_service_id()
    )
  )
  with check (
    public.current_user_role() = 'service_manager'
    and exists (
      select 1 from public.rooms r
      where r.id = room_blackouts.room_id
        and r.service_id = public.current_user_service_id()
    )
  );

create policy "Service managers can delete blackouts for their rooms"
  on public.room_blackouts for delete
  to authenticated
  using (
    public.current_user_role() = 'service_manager'
    and exists (
      select 1 from public.rooms r
      where r.id = room_blackouts.room_id
        and r.service_id = public.current_user_service_id()
    )
  );

-- Motif d'annulation sur la demande (optionnel si migration appliquée)
alter table public.reservation_requests
  add column if not exists cancellation_reason text;
