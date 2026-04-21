# IT Asset Manager

React + TypeScript IT asset management app with Supabase backend support and a built-in demo mode fallback.

The current application source of truth is under `src/`. The older `js/`, `css/`, and standalone prototype files remain in the repo only as legacy reference material.

## Stack

- `React + TypeScript + Vite`
- `React Router`
- `TanStack Query`
- `React Hook Form + Zod`
- `Tailwind CSS`
- `Supabase` for Postgres, Auth, Storage, RPC, and Edge Functions
- `Vercel` for SPA deployment

## What Is Implemented

- Login flow with protected workspace routes
- Dashboard with asset, assignment, maintenance, and warranty metrics
- Assets list and detail pages
- Employees list and detail pages
- Assignment and return workflows
- Maintenance open/close workflows
- Admin user management screen
- Supabase SQL migration and admin Edge Functions
- Unit, component, and Playwright test scaffolding

## Local Setup

1. Install Node.js 20+ and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set Supabase environment variables:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```

The app also accepts `VITE_SUPABASE_PUBLISHABLE_KEY` and the legacy
`VITE_SUPABASE_ANON_KEY`, but `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is the
recommended client-side variable for this repo.

5. Start the app with `npm run dev`.
6. If you want to use the VS Code Live Server extension, run `npm run build` first. This workspace is configured so Live Server serves the compiled `dist/` folder on `http://127.0.0.1:5501` instead of the raw Vite source files.

## Supabase Authentication

Use Supabase Auth credentials for login and signup. Supabase user records are stored in the `profiles` table, and permissions are enforced by the admin user access screen.

## Access Model

- `/login` is the default entry point.
- Dashboard, asset, employee, assignment, maintenance, and admin routes require sign-in.

## Supabase Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/0001_init.sql`.
3. Configure Auth URL settings in Supabase:
   - Set `Site URL` to your app URL.
   - Add your local URL (for example `http://localhost:5173`) and deployed URL as redirect URLs.
4. Signups create `profiles` records automatically through a database trigger.
5. Deploy the Edge Functions in:
   - `supabase/functions/admin-invite-user`
   - `supabase/functions/admin-update-user-role`
6. Configure the custom function secret:
   - `APP_URL`

Hosted Supabase Edge Functions already expose `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
and `SUPABASE_SERVICE_ROLE_KEY` by default.

If email confirmation is left on, which is Supabase's default behavior, new users
must confirm their email before signing in for the first time.

## Test Commands

- `npm test`
- `npm run test:watch`
- `npm run test:e2e`

## Deployment

- Deploy the frontend to Vercel.
- Keep the provided `vercel.json` rewrite so SPA routes resolve correctly.
- Store `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in Vercel project env vars.
