-- ============================================================
-- Zikr backend — single greenfield migration.
--
-- Security model:
--   1. All tables live in the zikr_app schema with RLS policies that do
--      the row-level authorization (ownership / membership / own-device).
--   2. zikr_app is NOT exposed via PostgREST: "Exposed schemas" in the
--      dashboard stays [public] only, so no table has a REST endpoint.
--   3. User-callable RPCs live in public as SECURITY INVOKER — they run
--      with the caller's privileges, so the grants below + RLS authorize
--      every statement they execute. Callers need usage on zikr_app and
--      scoped table grants for the functions to work at all.
--   4. Internal helpers live in zikr_app, which the API cannot reach.
--      Helpers that must see whole tables (counts, membership checks used
--      by policies) are security definer — RLS does not recurse into them.
--   5. EXECUTE on public functions is revoked by default (including
--      Supabase's automatic grants); only the app-facing RPCs are granted
--      back, deliberately. New public functions are private on arrival.
-- ============================================================

create schema if not exists zikr_app;
grant usage on schema zikr_app to anon, authenticated;

-- ============================================================
-- Tables (zikr_app)
-- ============================================================

-- Rooms: the shared goal + the combined contribution total
create table zikr_app.rooms (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  title         text not null check (char_length(title) between 1 and 80),
  zikr_name     text not null,
  zikr_arabic   text,
  target        integer not null check (target between 1 and 100000000),
  total         integer not null default 0 check (total >= 0),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  owner_id      uuid not null,
  status        text not null default 'active' check (status in ('active', 'closed')),
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Members: names only. Holds zero contribution data.
create table zikr_app.members (
  room_id    uuid not null references zikr_app.rooms (id) on delete cascade,
  user_id    uuid not null,
  name       text not null check (char_length(btrim(name)) between 1 and 24),
  joined_at  timestamptz not null default now(),
  removed_at timestamptz,
  primary key (room_id, user_id)
);

-- Idempotency ledger for increments. UUIDs only — no counts, no user ids.
-- Purged after 7 days by purge_expired().
create table zikr_app.applied_event_ids (
  event_id   uuid primary key,
  room_id    uuid not null references zikr_app.rooms (id) on delete cascade,
  applied_at timestamptz not null default now()
);

-- One row per device. The token is the analytics key; the anon auth uid is
-- only the secure handle used to issue/look it up.
create table zikr_app.devices (
  token        text primary key check (char_length(token) = 12),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Raw usage events. Insert-only via RPC; nobody can read them back.
create table zikr_app.analytics_events (
  id           bigint generated always as identity primary key,
  device_token text not null,
  name         text not null check (char_length(name) between 1 and 40),
  properties   jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index analytics_events_name_time_idx on zikr_app.analytics_events (name, created_at desc);

-- ============================================================
-- Internal helpers (zikr_app — invisible to the API)
-- Definer + stable: policies and functions must see whole tables,
-- and a policy on members cannot query members directly (recursion).
-- Defined before the policies that call them.
-- ============================================================

-- Unambiguous code alphabet: no 0/O/1/I/L.
create function zikr_app.random_room_code() returns text
language sql volatile as $$
  select array_to_string(
    array(
      select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 31)::int + 1, 1)
      from generate_series(1, 6)
    ),
    ''
  );
$$;

create function zikr_app.random_device_token() returns text
language sql volatile as $$
  select array_to_string(
    array(
      select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 31)::int + 1, 1)
      from generate_series(1, 12)
    ),
    ''
  );
$$;

create function zikr_app.is_room_member(p_room_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from zikr_app.members m
    where m.room_id = p_room_id and m.user_id = p_user_id and m.removed_at is null
  );
$$;

create function zikr_app.is_room_owner(p_room_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from zikr_app.rooms r
    where r.id = p_room_id and r.owner_id = p_user_id
  );
$$;

create function zikr_app.room_member_count(p_room_id uuid)
returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from zikr_app.members m
  where m.room_id = p_room_id and m.removed_at is null;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table zikr_app.rooms enable row level security;
alter table zikr_app.members enable row level security;
alter table zikr_app.applied_event_ids enable row level security;
alter table zikr_app.devices enable row level security;
alter table zikr_app.analytics_events enable row level security;

-- Rooms: goal definitions are readable (the app flow is code-gated, and
-- the table has no REST endpoint — only functions select from it).
create policy "rooms readable" on zikr_app.rooms
  for select using (true);

create policy "owner inserts room" on zikr_app.rooms
  for insert with check (owner_id = auth.uid());

-- Owners close (status); any active member contributes (total).
create policy "owner or member updates room" on zikr_app.rooms
  for update using (
    zikr_app.is_room_owner(id, auth.uid())
    or zikr_app.is_room_member(id, auth.uid())
  );

-- Members: the roster is readable by current members of that room, and
-- everyone always sees their own membership row — required so that
-- INSERT ... ON CONFLICT DO UPDATE (join/rejoin) can see the proposed row.
create policy "members readable by room members" on zikr_app.members
  for select using (
    user_id = auth.uid()
    or zikr_app.is_room_member(room_id, auth.uid())
  );

create policy "users join as themselves" on zikr_app.members
  for insert with check (user_id = auth.uid());

-- Self leaves (own row); owner removes others.
create policy "self or owner updates member" on zikr_app.members
  for update using (
    user_id = auth.uid()
    or zikr_app.is_room_owner(room_id, auth.uid())
  );

-- Idempotency ledger: members record and replay-check their own events.
create policy "event ids readable by room members" on zikr_app.applied_event_ids
  for select using (zikr_app.is_room_member(room_id, auth.uid()));

create policy "event ids written by room members" on zikr_app.applied_event_ids
  for insert with check (zikr_app.is_room_member(room_id, auth.uid()));

-- Devices: strictly own-row.
create policy "own device row" on zikr_app.devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Usage events: append-only, and only with your own device token.
create policy "own device inserts events" on zikr_app.analytics_events
  for insert with check (
    exists (
      select 1 from zikr_app.devices d
      where d.token = device_token and d.user_id = auth.uid()
    )
  );

-- ============================================================
-- Table grants — the minimum the invoker RPCs need
-- ============================================================

grant select, insert, update (total, status) on zikr_app.rooms to anon, authenticated;
grant select, insert, update (name, joined_at, removed_at) on zikr_app.members to anon, authenticated;
grant select, insert on zikr_app.applied_event_ids to anon, authenticated;
grant select, insert, update (last_seen_at) on zikr_app.devices to anon, authenticated;
grant insert on zikr_app.analytics_events to anon, authenticated;

-- ============================================================
-- User-callable RPCs (public, SECURITY INVOKER)
-- Authorization = grants + RLS; the explicit `raise` checks remain
-- because the app maps them to error codes (RLS only filters rows).
-- ============================================================

create or replace function public.get_room_state(p_code text)
returns json
language plpgsql stable security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room zikr_app.rooms;
begin
  select * into v_room from zikr_app.rooms where code = upper(btrim(coalesce(p_code, '')));
  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;

  return json_build_object(
    'room', json_build_object(
      'id', v_room.id,
      'code', v_room.code,
      'title', v_room.title,
      'zikrName', v_room.zikr_name,
      'zikrArabic', v_room.zikr_arabic,
      'target', v_room.target,
      'total', v_room.total,
      'startsAt', v_room.starts_at,
      'endsAt', v_room.ends_at,
      'ownerId', v_room.owner_id,
      'status', v_room.status
    ),
    'members', (
      select coalesce(
        json_agg(
          json_build_object('name', m.name, 'joinedAt', m.joined_at, 'userId', m.user_id)
          order by m.joined_at
        ),
        '[]'::json
      )
      from zikr_app.members m
      where m.room_id = v_room.id and m.removed_at is null
    ),
    'isMember', exists (
      select 1 from zikr_app.members m
      where m.room_id = v_room.id and m.user_id = v_uid and m.removed_at is null
    )
  );
end;
$$;

create or replace function public.create_room(
  p_title text,
  p_zikr_name text,
  p_zikr_arabic text,
  p_target integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_name text
) returns json
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_room zikr_app.rooms;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  if p_target is null or p_target < 1 or p_target > 100000000 then
    raise exception 'invalid_target';
  end if;
  if p_ends_at is null or p_starts_at is null or p_ends_at <= p_starts_at then
    raise exception 'invalid_window';
  end if;
  if now() > p_ends_at then
    raise exception 'window_already_ended';
  end if;
  if p_name is null or char_length(btrim(p_name)) = 0 then
    raise exception 'invalid_name';
  end if;

  loop
    v_code := zikr_app.random_room_code();
    begin
      insert into zikr_app.rooms (code, title, zikr_name, zikr_arabic, target, starts_at, ends_at, owner_id)
      values (v_code, left(btrim(p_title), 80), left(btrim(p_zikr_name), 80), nullif(btrim(p_zikr_arabic), ''),
              p_target, p_starts_at, p_ends_at, v_uid)
      returning * into v_room;
      exit;
    exception when unique_violation then
      continue; -- code collision, try another
    end;
  end loop;

  insert into zikr_app.members (room_id, user_id, name)
  values (v_room.id, v_uid, left(btrim(p_name), 24));

  return public.get_room_state(v_room.code);
end;
$$;

create or replace function public.join_room(p_code text, p_name text)
returns json
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room zikr_app.rooms;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_name is null or char_length(btrim(p_name)) = 0 then
    raise exception 'invalid_name';
  end if;

  select * into v_room from zikr_app.rooms where code = upper(btrim(coalesce(p_code, '')));
  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;
  if v_room.status <> 'active' then
    raise exception 'room_closed';
  end if;
  if now() > v_room.ends_at then
    raise exception 'window_ended';
  end if;
  -- Helper sees the whole roster; RLS would hide other members' rows.
  if zikr_app.room_member_count(v_room.id) >= 100 then
    raise exception 'room_full';
  end if;

  -- Join or rejoin (a returning member keeps a single row).
  insert into zikr_app.members (room_id, user_id, name)
  values (v_room.id, v_uid, left(btrim(p_name), 24))
  on conflict (room_id, user_id) do update
    set name = excluded.name, removed_at = null, joined_at = now();

  return public.get_room_state(v_room.code);
end;
$$;

-- Atomic, idempotent contribution increment. The ONLY way counts change.
create or replace function public.contribute(p_code text, p_delta integer, p_event_id uuid)
returns json
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room zikr_app.rooms;
  v_total integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_delta is null or p_delta < 1 or p_delta > 10000 then
    raise exception 'invalid_delta';
  end if;
  if p_event_id is null then
    raise exception 'invalid_event';
  end if;

  -- NOTE: no FOR UPDATE here — under RLS, SELECT ... FOR UPDATE only returns
  -- rows the UPDATE policy can see, so non-members would get room_not_found
  -- instead of not_a_member. Validate first, then update atomically below.
  select * into v_room from zikr_app.rooms
  where code = upper(btrim(coalesce(p_code, ''))) and status = 'active';
  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;
  if now() < v_room.starts_at then
    raise exception 'window_not_started';
  end if;
  if now() > v_room.ends_at then
    raise exception 'window_ended';
  end if;
  if not zikr_app.is_room_member(v_room.id, v_uid) then
    raise exception 'not_a_member';
  end if;

  -- Idempotency: a retried event is acknowledged without re-applying.
  insert into zikr_app.applied_event_ids (event_id, room_id) values (p_event_id, v_room.id)
  on conflict (event_id) do nothing;
  if not found then
    select total into v_total from zikr_app.rooms where id = v_room.id;
    return json_build_object('total', v_total);
  end if;

  -- The increment is atomic (row lock + re-evaluated expression). The status
  -- guard closes the check-vs-update race with close_room.
  update zikr_app.rooms set total = total + p_delta
  where id = v_room.id and status = 'active'
  returning total into v_total;
  if not found then
    raise exception 'window_ended';
  end if;

  return json_build_object('total', v_total);
end;
$$;

create or replace function public.remove_member(p_code text, p_user_id uuid)
returns void
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room zikr_app.rooms;
begin
  select * into v_room from zikr_app.rooms where code = upper(btrim(coalesce(p_code, '')));
  if not found then raise exception 'room_not_found' using errcode = 'P0002'; end if;
  if v_room.owner_id <> v_uid then raise exception 'not_owner'; end if;

  update zikr_app.members set removed_at = now()
  where room_id = v_room.id and user_id = p_user_id and removed_at is null;
end;
$$;

create or replace function public.leave_room(p_code text)
returns void
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  update zikr_app.members set removed_at = now()
  where user_id = v_uid and removed_at is null
    and room_id = (select id from zikr_app.rooms where code = upper(btrim(coalesce(p_code, ''))));
end;
$$;

create or replace function public.close_room(p_code text)
returns void
language plpgsql volatile security invoker set search_path = public as $$
begin
  update zikr_app.rooms set status = 'closed'
  where code = upper(btrim(coalesce(p_code, '')))
    and owner_id = auth.uid()
    and status = 'active';
  if not found then raise exception 'not_owner_or_not_found'; end if;
end;
$$;

-- Issued once per device (anon user), refreshed on every call. The client
-- stores the token in IndexedDB and treats it as its stable device key.
create or replace function public.get_or_create_device_token()
returns text
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_token text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select token into v_token from zikr_app.devices where user_id = v_uid;
  if found then
    update zikr_app.devices set last_seen_at = now() where user_id = v_uid;
    return v_token;
  end if;

  loop
    v_token := zikr_app.random_device_token();
    begin
      insert into zikr_app.devices (token, user_id) values (v_token, v_uid);
      return v_token;
    exception when unique_violation then
      continue;
    end;
  end loop;
end;
$$;

-- Best-effort usage event. Never raises: metrics must not break the app.
create or replace function public.track_event(p_name text, p_properties jsonb default '{}')
returns void
language plpgsql volatile security invoker set search_path = public as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    return;
  end if;

  select token into v_token from zikr_app.devices where user_id = auth.uid();
  if found then
    update zikr_app.devices set last_seen_at = now() where user_id = auth.uid();
  else
    v_token := public.get_or_create_device_token();
  end if;

  insert into zikr_app.analytics_events (device_token, name, properties)
  values (v_token, left(p_name, 40), p_properties);
end;
$$;

-- ============================================================
-- Housekeeping (public so the service-role keep-alive job and pg_cron
-- can reach it, but NOT granted to app clients).
-- ============================================================

create or replace function public.purge_expired()
returns void
language sql security definer set search_path = public as $$
  delete from zikr_app.applied_event_ids where applied_at < now() - interval '7 days';
  delete from zikr_app.analytics_events where created_at < now() - interval '90 days';
  delete from zikr_app.rooms where ends_at < now() - interval '60 days';
$$;

-- ============================================================
-- EXECUTE surface — private by default, nine deliberate grants
-- ============================================================

revoke execute on all functions in schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

grant execute on function public.create_room(text, text, text, integer, timestamptz, timestamptz, text) to anon, authenticated;
grant execute on function public.join_room(text, text) to anon, authenticated;
grant execute on function public.contribute(text, integer, uuid) to anon, authenticated;
grant execute on function public.get_room_state(text) to anon, authenticated;
grant execute on function public.remove_member(text, uuid) to anon, authenticated;
grant execute on function public.leave_room(text) to anon, authenticated;
grant execute on function public.close_room(text) to anon, authenticated;
grant execute on function public.get_or_create_device_token() to anon, authenticated;
grant execute on function public.track_event(text, jsonb) to anon, authenticated;

grant execute on function public.purge_expired() to service_role;

-- Optional: schedule the purge with pg_cron (enable the extension in the
-- Supabase dashboard first), or call public.purge_expired() with the
-- service role key from the project's keep-alive job.
-- select cron.schedule('zikr-purge-expired', '0 3 * * *', $$select public.purge_expired()$$);
