-- ============================================================
-- Minimal Supabase-like environment for validating migrations locally.
-- This mirrors exactly the pieces of Supabase our SQL touches:
--   * the three API roles (no-login; tests `SET ROLE` into them)
--   * schema `auth` with auth.uid() reading the JWT claims GUC
--   * table auth.users (FK target for devices.user_id)
-- Everything else (PostgREST, GoTrue, etc.) is not represented — this
-- harness validates SQL semantics (RLS, functions, triggers, grants).
-- ============================================================

create role anon nologin;
create role authenticated nologin;
create role service_role nologin;

create schema if not exists auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Same contract as Supabase: the caller's identity comes from the
-- request.jwt.claims GUC (set by the test with set_config or SET).
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;

-- Supabase grants these out of the box; the migration relies on them
-- (e.g. security invoker RPCs calling auth.uid()).
grant usage on schema auth to anon, authenticated, service_role;
