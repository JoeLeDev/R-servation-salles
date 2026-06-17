# Réservation Cité

Système de demande de réservation de salles pour la Cité.

## Fonctionnalités

- Catalogue de **22 salles** (auditoriums, polyvalentes, salons, studios, espaces enfants)
- **Demande de réservation** avec validation par le service concerné
- Authentification **email (magic link)** et **Google** via Supabase
- Espace **Mes demandes** pour suivre le statut
- Page **Validation** pour les responsables de service

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Copiez `.env.local.example` vers `.env.local` et renseignez vos clés
3. Dans le **SQL Editor** de Supabase, exécutez **toutes** les migrations dans l'ordre :

   1. `supabase/migrations/20250608120000_initial_schema.sql`
   2. `supabase/migrations/20250608130000_public_read_rooms.sql`
   3. `supabase/migrations/20250608140000_fix_rls_recursion.sql`
   4. `supabase/migrations/20250608150000_fix_profiles_insert.sql`
   5. `supabase/migrations/20250609120000_features.sql` *(conflits, validation 2 étapes, commentaires, pièces jointes)*
   6. `supabase/migrations/20250610120000_extended_features.sql` *(historique, blocages, domaines email, comptes actifs)*
   7. `supabase/migrations/20250610130000_auditorium_details.sql` *(fiche Auditorium)*

### 3. Configurer l'authentification

Dans **Authentication → Providers** :

- **Email** : activer (magic link)
- **Google** : activer et renseigner Client ID / Secret

Dans **Authentication → URL Configuration** :

| Champ | Valeur |
|-------|--------|
| Site URL | `https://r-servation-salles.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `http://localhost:3001/auth/callback` |
| | `https://votre-app.vercel.app/auth/callback` |
| | `https://votre-app.vercel.app/**` |

### 4. Déployer sur Vercel

Le fichier `.env` local **n'est pas envoyé sur Vercel** (gitignore).

Dans **Vercel → Project → Settings → Environment Variables**, ajoutez pour **Production** :

```
NEXT_PUBLIC_SUPABASE_URL=https://jrednmiwomkyabbhkzat.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://votre-app.vercel.app
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Puis **redéployez** (Deployments → Redeploy).

> `NEXT_PUBLIC_SITE_URL` doit être l'URL exacte de production (avec `https://`), pas `localhost`.

### 5. Lancer le projet en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| `employee` | Faire des demandes, voir ses demandes |
| `service_manager` | Valider les demandes de son service |
| `admin` | Valider toutes les demandes, gérer utilisateurs et salles (`/admin`) |

L'administrateur accède à **`/admin/utilisateurs`** pour :

- voir tous les comptes ;
- modifier les rôles et services ;
- créer des utilisateurs (email + mot de passe).

Pour la création d'utilisateurs, ajoutez `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` (jamais en `NEXT_PUBLIC_`).

Pour promouvoir un utilisateur manuellement (SQL) :

```sql
update public.profiles
set role = 'service_manager', service_id = (
  select id from public.services where name = 'Événementiel'
)
where email = 'responsable@exemple.com';
```

## Services et salles

| Service | Salles |
|---------|--------|
| Événementiel | Auditorium, Diamant, Onyx, Diamant & Onyx, Sardoine, Saphir, Topaze, Or |
| Salons & Réunions | Emeraude, Escarboucle, Sardonyx, Sardius |
| Production audiovisuelle | Émission TV, Plateau TV fond vert, Débat TV table ronde, Enregistrement audio |
| Espace enfants | Améthyste, Crysolithe, Jaspe, Hyacinthe, Agathe, Béril |

## À venir

- Plans interactifs des salles (photos fournies par le client)
- Règles métier configurables (durées, délais)
- Intégration GTB (éclairage, chauffage)
- Notifications email automatiques

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Auth + PostgreSQL)
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS
- PWA (Serwist) — installable sur mobile et bureau

## PWA (Progressive Web App)

L'application est installable comme une app native :

- **Manifest** : `/manifest.webmanifest`
- **Service worker** : cache des pages + page hors ligne (`/~offline`)
- **Icônes** : générées automatiquement (`RC` sur fond bleu)

### Installer l'app

- **iPhone/iPad** : Safari → Partager → « Sur l'écran d'accueil »
- **Android** : Chrome → menu → « Installer l'application »
- **Desktop** : Chrome/Edge → icône d'installation dans la barre d'adresse

> En développement (`npm run dev`), le service worker est désactivé. Testez l'installation avec `npm run build && npm start`.

### Dépannage PWA + auth

Si la page `/connexion` plante avec `no-response` ou `429` dans la console :

1. **Vider le cache du site** : DevTools → Application → Storage → Clear site data
2. **Désinscrire le service worker** : Application → Service Workers → Unregister
3. Attendre **15–60 min** si erreur `429` (limite Supabase sur les emails de connexion)
4. Redéployer après mise à jour du code
# R-servation-salles
