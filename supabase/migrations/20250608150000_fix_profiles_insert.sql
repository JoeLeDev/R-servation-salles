-- Permettre aux utilisateurs de créer leur propre profil si le trigger a raté
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Créer les profils manquants pour les comptes déjà existants
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(u.email, '@', 1)
  )
from auth.users as u
where not exists (
  select 1 from public.profiles as p where p.id = u.id
);
