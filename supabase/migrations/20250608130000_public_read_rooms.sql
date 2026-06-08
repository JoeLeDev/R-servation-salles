-- Permettre à tout le monde (y compris non connecté) de voir le catalogue des salles

drop policy if exists "Authenticated users can read services" on public.services;
drop policy if exists "Authenticated users can read active rooms" on public.rooms;

create policy "Public can read services"
  on public.services for select
  to anon, authenticated
  using (true);

create policy "Public can read active rooms"
  on public.rooms for select
  to anon, authenticated
  using (is_active = true);
