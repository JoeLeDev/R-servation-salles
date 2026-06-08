-- Services responsables de la validation des demandes
create type public.user_role as enum ('employee', 'service_manager', 'admin');
create type public.room_type as enum (
  'auditorium',
  'salle_polyvalente',
  'salon',
  'studio',
  'espace_enfants'
);
create type public.pricing_type as enum ('from', 'quote', 'free');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  room_type public.room_type not null,
  surface_sqm integer,
  capacity integer,
  pricing_type public.pricing_type not null default 'quote',
  base_price numeric(10, 2),
  service_id uuid not null references public.services (id) on delete restrict,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role public.user_role not null default 'employee',
  service_id uuid references public.services (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete restrict,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  attendees integer,
  status public.request_status not null default 'pending',
  reviewer_id uuid references public.profiles (id) on delete set null,
  review_comment text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_requests_valid_range check (end_at > start_at)
);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index idx_rooms_service_id on public.rooms (service_id);
create index idx_rooms_room_type on public.rooms (room_type);
create index idx_reservation_requests_room_id on public.reservation_requests (room_id);
create index idx_reservation_requests_requester_id on public.reservation_requests (requester_id);
create index idx_reservation_requests_status on public.reservation_requests (status);
create index idx_reservation_requests_dates on public.reservation_requests (start_at, end_at);

-- Trigger: créer un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger reservation_requests_updated_at
  before update on public.reservation_requests
  for each row execute function public.set_updated_at();

-- Fonctions helper RLS (évitent la récursion infinie sur profiles)
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_service_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select service_id from public.profiles where id = auth.uid();
$$;

-- RLS
alter table public.services enable row level security;
alter table public.rooms enable row level security;
alter table public.profiles enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.app_settings enable row level security;

-- Services & salles : lecture pour tous les utilisateurs authentifiés
create policy "Public can read services"
  on public.services for select
  to anon, authenticated
  using (true);

create policy "Public can read active rooms"
  on public.rooms for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins can insert rooms"
  on public.rooms for insert
  to authenticated
  with check (public.current_user_role() = 'admin');

create policy "Admins can update rooms"
  on public.rooms for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can delete rooms"
  on public.rooms for delete
  to authenticated
  using (public.current_user_role() = 'admin');

-- Profils
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Managers can read service profiles"
  on public.profiles for select
  to authenticated
  using (
    public.current_user_role() in ('service_manager', 'admin')
    and (
      public.current_user_role() = 'admin'
      or service_id = public.current_user_service_id()
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Demandes de réservation
create policy "Users can read own requests"
  on public.reservation_requests for select
  to authenticated
  using (requester_id = auth.uid());

create policy "Service managers can read requests for their service rooms"
  on public.reservation_requests for select
  to authenticated
  using (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'service_manager'
      and exists (
        select 1
        from public.rooms as r
        where r.id = reservation_requests.room_id
          and r.service_id = public.current_user_service_id()
      )
    )
  );

create policy "Authenticated users can create requests"
  on public.reservation_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Users can cancel own pending requests"
  on public.reservation_requests for update
  to authenticated
  using (
    requester_id = auth.uid() and status = 'pending'
  )
  with check (
    requester_id = auth.uid() and status = 'cancelled'
  );

create policy "Service managers can review requests"
  on public.reservation_requests for update
  to authenticated
  using (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'service_manager'
      and exists (
        select 1
        from public.rooms as r
        where r.id = reservation_requests.room_id
          and r.service_id = public.current_user_service_id()
      )
    )
  )
  with check (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'service_manager'
      and exists (
        select 1
        from public.rooms as r
        where r.id = reservation_requests.room_id
          and r.service_id = public.current_user_service_id()
      )
    )
  );

create policy "Authenticated users can read app settings"
  on public.app_settings for select
  to authenticated
  using (true);

-- Données initiales
insert into public.services (name, description) values
  ('Événementiel', 'Grands espaces, auditoriums et salles polyvalentes'),
  ('Salons & Réunions', 'Salons et espaces de réunion'),
  ('Production audiovisuelle', 'Studios TV, radio et enregistrement'),
  ('Espace enfants', 'Espaces dédiés aux activités familiales');

insert into public.app_settings (key, value) values
  ('booking_rules', '{
    "min_duration_minutes": 30,
    "max_duration_hours": 8,
    "min_advance_hours": 24,
    "cancellation_hours": 2,
    "require_approval": true
  }'::jsonb);

-- Salles
with service_map as (
  select id, name from public.services
)
insert into public.rooms (slug, name, room_type, surface_sqm, capacity, pricing_type, base_price, service_id)
select
  v.slug,
  v.name,
  v.room_type::public.room_type,
  v.surface_sqm,
  v.capacity,
  v.pricing_type::public.pricing_type,
  v.base_price,
  s.id
from (values
  ('auditorium', 'Auditorium', 'auditorium', 4000, 3500, 'quote', null::numeric, 'Événementiel'),
  ('diamant', 'Diamant', 'salle_polyvalente', 500, 500, 'from', 3500, 'Événementiel'),
  ('onyx', 'Onyx', 'salle_polyvalente', 500, 500, 'from', 3500, 'Événementiel'),
  ('diamant-onyx', 'Diamant & Onyx', 'salle_polyvalente', 1000, 1000, 'from', 7000, 'Événementiel'),
  ('sardoine', 'Sardoine', 'salle_polyvalente', 200, 200, 'from', 1500, 'Événementiel'),
  ('saphir', 'Saphir', 'salle_polyvalente', 200, 200, 'from', 1500, 'Événementiel'),
  ('topaze', 'Topaze', 'salle_polyvalente', 400, 400, 'from', 2000, 'Événementiel'),
  ('or', 'Or', 'salle_polyvalente', 200, 200, 'from', 1500, 'Événementiel'),
  ('emeraude', 'Emeraude', 'salon', 60, 40, 'from', 390, 'Salons & Réunions'),
  ('escarboucle', 'Escarboucle', 'salon', 50, 20, 'from', 330, 'Salons & Réunions'),
  ('sardonyx', 'Sardonyx', 'salon', 30, 12, 'from', 200, 'Salons & Réunions'),
  ('sardius', 'Sardius', 'salon', 40, 30, 'from', 260, 'Salons & Réunions'),
  ('emission-tv', 'Émission TV', 'studio', 110, 50, 'quote', null, 'Production audiovisuelle'),
  ('plateau-tv-fond-vert', 'Plateau TV fond vert', 'studio', 50, 10, 'quote', null, 'Production audiovisuelle'),
  ('debat-tv-table-ronde', 'Débat TV table ronde', 'studio', 30, 7, 'quote', null, 'Production audiovisuelle'),
  ('enregistrement-audio', 'Enregistrement audio', 'studio', 40, 10, 'quote', null, 'Production audiovisuelle'),
  ('amethyste', 'Améthyste', 'espace_enfants', 85, 50, 'free', null, 'Espace enfants'),
  ('crysolithe', 'Crysolithe', 'espace_enfants', 85, 50, 'free', null, 'Espace enfants'),
  ('jaspe', 'Jaspe', 'espace_enfants', 85, 50, 'free', null, 'Espace enfants'),
  ('hyacinthe', 'Hyacinthe', 'espace_enfants', 160, 100, 'free', null, 'Espace enfants'),
  ('agathe', 'Agathe', 'espace_enfants', 120, null, 'free', null, 'Espace enfants'),
  ('beril', 'Béril', 'espace_enfants', 85, null, 'free', null, 'Espace enfants')
) as v(slug, name, room_type, surface_sqm, capacity, pricing_type, base_price, service_name)
join service_map s on s.name = v.service_name;
