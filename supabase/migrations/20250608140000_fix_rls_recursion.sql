-- Corrige la récursion infinie RLS sur la table profiles
-- Cause : les policies lisaient profiles depuis profiles (boucle infinie)

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

-- === PROFILES ===
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Service managers can read profiles in their scope" on public.profiles;

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

-- === ROOMS ===
drop policy if exists "Admins can manage rooms" on public.rooms;

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

-- === RESERVATION REQUESTS ===
drop policy if exists "Service managers can read requests for their service rooms" on public.reservation_requests;
drop policy if exists "Service managers can review requests" on public.reservation_requests;

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
