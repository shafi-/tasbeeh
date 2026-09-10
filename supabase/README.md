# Supabase — Shared Goals backend

The shared-goals (rooms) feature uses a Supabase project as its sync backend.
See `docs/SharedGoals-Design.md` for the full design.

## Setup

1. Create a project at [supabase.com](https://supabase.com) (free tier is sufficient).
2. In **Authentication → Providers**, enable **Anonymous sign-in** (required —
   this is how the app works without logins).
3. Apply the migration: run the SQL in `migrations/0001_shared_goals.sql` in the
   Supabase dashboard (**SQL Editor**), or via the CLI with
   `supabase db push` after linking your project.
4. Optionally enable the `pg_cron` extension and uncomment the
   `cron.schedule` line at the bottom of the migration to auto-purge expired
   event ids and old rooms — or call `public.purge_expired()` from your
   project's keep-alive job.
5. Copy the project URL and anon key into the app's environment:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

The anon key is safe to ship: it only works through the RPCs and RLS policies
defined in the migration, and the backend never stores per-member contribution
data (see the design doc).
