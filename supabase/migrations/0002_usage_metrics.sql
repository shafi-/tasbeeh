-- ============================================================
-- Usage metrics — privacy-preserving
-- A server-generated 12-char device token identifies DEVICES (never
-- people), and anonymous usage events accumulate for aggregate analytics.
-- Deliberately NOT stored: contribution amounts, any per-member progress.
-- See docs/SharedGoals-Design.md
-- ============================================================

-- One row per device. The token is the analytics key; the anon auth uid is
-- only the secure handle used to issue/look it up.
create table public.devices (
  token        text primary key check (char_length(token) = 12),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Raw usage events. Insert-only via RPC; clients can never read them.
create table public.analytics_events (
  id           bigint generated always as identity primary key,
  device_token text not null,
  name         text not null check (char_length(name) between 1 and 40),
  properties   jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index analytics_events_name_time_idx on public.analytics_events (name, created_at desc);

alter table public.devices enable row level security;
alter table public.analytics_events enable row level security;
-- No policies on either table: all access flows through the definer RPCs.

-- ============================================================
-- RPCs
-- ============================================================

create function public.random_device_token() returns text
language sql volatile as $$
  select array_to_string(
    array(
      select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 31)::int + 1, 1)
      from generate_series(1, 12)
    ),
    ''
  );
$$;

-- Issued once per device (anon user), refreshed on every call. The client
-- stores the token in IndexedDB and treats it as its stable device key.
create or replace function public.get_or_create_device_token()
returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_token text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select token into v_token from public.devices where user_id = v_uid;
  if found then
    update public.devices set last_seen_at = now() where user_id = v_uid;
    return v_token;
  end if;

  loop
    v_token := public.random_device_token();
    begin
      insert into public.devices (token, user_id) values (v_token, v_uid);
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
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    return;
  end if;

  select token into v_token from public.devices where user_id = auth.uid();
  if found then
    update public.devices set last_seen_at = now() where user_id = auth.uid();
  else
    v_token := public.get_or_create_device_token();
  end if;

  insert into public.analytics_events (device_token, name, properties)
  values (v_token, left(p_name, 40), p_properties);
end;
$$;

grant execute on function public.get_or_create_device_token() to anon, authenticated;
grant execute on function public.track_event(text, jsonb) to anon, authenticated;

-- Extend housekeeping: raw events are only useful aggregated, keep 90 days.
create or replace function public.purge_expired()
returns void
language sql security definer set search_path = public as $$
  delete from public.applied_event_ids where applied_at < now() - interval '7 days';
  delete from public.analytics_events where created_at < now() - interval '90 days';
  delete from public.rooms where ends_at < now() - interval '60 days';
$$;
