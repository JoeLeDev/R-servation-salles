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
3. Dans le **SQL Editor** de Supabase, exécutez le fichier :
   `supabase/migrations/20250608120000_initial_schema.sql`

### 3. Configurer l'authentification

Dans **Authentication → Providers** :

- **Email** : activer (magic link)
- **Google** : activer et renseigner Client ID / Secret

Dans **Authentication → URL Configuration** :

- Site URL : `http://localhost:3000`
- Redirect URLs : `http://localhost:3000/auth/callback`

### 4. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| `employee` | Faire des demandes, voir ses demandes |
| `service_manager` | Valider les demandes de son service |
| `admin` | Valider toutes les demandes |

Pour promouvoir un utilisateur en responsable de service :

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
# R-servation-salles
