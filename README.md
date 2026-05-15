# IT Asset Manager

Production-ready IT asset management app built with `React + TypeScript + Vite`, `Tailwind CSS`, and `Supabase`.

The app now runs on a single real backend path:

- No demo mode fallback
- Supabase Auth for signup, login, logout, and persisted sessions
- Protected workspace routes
- Supabase-backed assets, employees, assignments, maintenance, documents, activity logs, and profiles
- Admin tooling through Supabase Edge Functions

## Stack

- `React + TypeScript + Vite`
- `React Router`
- `TanStack Query`
- `React Hook Form + Zod`
- `Tailwind CSS`
- `Supabase` for Postgres, Auth, Storage, RPC, and Edge Functions
- `Vercel` for SPA deployment

## Runtime Notes

- This repo is a `Vite` app, not Next.js.
- The frontend still uses the env names you requested:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `vite.config.ts` is configured to expose `NEXT_PUBLIC_*` variables to the client.

## Supabase Project

Set the app to use this project URL:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vqvrbfuajijtnarvlwuz.supabase.co
```

You still need to supply the matching anon key from:

`Supabase Dashboard -> Project Settings -> API -> Project API keys`

## Environment Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Keep `APP_URL=http://localhost:5173` for local development.
4. Only for the seed script, set `SUPABASE_SERVICE_ROLE_KEY`.

Example:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vqvrbfuajijtnarvlwuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
APP_URL=http://localhost:5173
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Database Setup

Apply the existing schema in:

`supabase/migrations/0001_init.sql`
`supabase/migrations/0002_delete_asset.sql`

The migration creates and configures:

- `profiles`
- `assets`
- `employees`
- `asset_assignments`
- `maintenance_records`
- `asset_documents`
- `activity_logs`
- RLS policies
- storage bucket `asset-files`
- RPC functions for assignment, returns, archive, delete, and maintenance flows
- auth triggers that keep `profiles` in sync with `auth.users`

### Minimum Requirement Mapping

The existing production schema is richer than the minimum requested `assets` table. Instead of a single `assigned_to` text column, the app uses normalized employee and assignment tables so the current UI keeps working.

## Authentication

Supabase Auth is fully wired for:

- Email/password signup
- Email/password login
- Logout
- Session persistence
- Protected routes for the dashboard and workspace screens

If email confirmation is enabled in Supabase, signup will create the user and then prompt them to confirm their email before signing in.

## Admin Edge Functions

The admin screens call Supabase Edge Functions with `fetch`:

- `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-invite-user`
- `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-update-user-role`

Each request includes:

- `Authorization: Bearer <current Supabase access token>`
- `apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>`
- `Content-Type: application/json`

## GitHub + Supabase CI/CD

This repo includes `.github/workflows/supabase-deploy.yml`.

When changes are pushed to `main` under `supabase/**`, GitHub Actions will:

- install the Supabase CLI
- link to your Supabase project
- apply new database migrations with `supabase db push`
- deploy all Edge Functions with `supabase functions deploy`
- update the `APP_URL` Edge Function secret when the GitHub secret is present

Add these GitHub repository secrets in:

`GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret`

- `SUPABASE_ACCESS_TOKEN`: Supabase account access token
- `SUPABASE_PROJECT_ID`: your Supabase project ref, for example the id in `https://supabase.com/dashboard/project/<project-ref>`
- `SUPABASE_DB_PASSWORD`: database password for that Supabase project
- `APP_URL`: deployed frontend URL, or `http://localhost:5173` for local-only testing

Supabase also offers a dashboard GitHub integration for Branching. For this repository, set the working directory to `.` because the `supabase/` folder is at the repo root.

## Default Admin User

The frontend cannot safely create an admin auth user by itself, so this repo includes an idempotent seed script:

```bash
npm run seed:default-user
```

Before running it, set `SUPABASE_SERVICE_ROLE_KEY`.

Default seeded user:

- Name: `Jayesh`
- Email: `jayesh@example.com`
- Password: `admin@123`

The script will:

- create the auth user if it does not exist
- reset the password if it already exists
- upsert the `profiles` row
- force the role to `admin`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure `.env.local` from `.env.example`.

3. Apply the SQL migration to your Supabase project.

4. Deploy the Edge Functions:

```bash
supabase functions deploy admin-invite-user
supabase functions deploy admin-update-user-role
```

5. Make sure the `APP_URL` function secret matches your frontend URL.

6. Seed the default admin user:

```bash
npm run seed:default-user
```

7. Start the app:

```bash
npm run dev
```

8. Sign in with:

```text
jayesh@example.com / admin@123
```

## Supabase Dashboard Settings

In `Authentication -> URL Configuration`:

- Set `Site URL` to your deployed frontend URL
- Add `http://localhost:5173` as a redirect URL for local development
- Add your Vercel URL as a redirect URL for production

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Set these environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Keep the existing `vercel.json` rewrite so SPA routes resolve to `index.html`.
5. Use the default build settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
6. Update Supabase Auth URL settings so your Vercel domain is allowed.

### Important

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
- Use `SUPABASE_SERVICE_ROLE_KEY` only locally, in CI, or inside secure server-side tooling.

## Test Commands

- `npm test`
- `npm run test:e2e`
- `npm run build`

## Legacy Files

The older standalone prototype scripts and CSS have been removed. The remaining root HTML prototype entry points redirect to the React app, and the active application source of truth is under `src/`.
