-- ============================================================
-- Shared Goals (Rooms) — initial schema
-- Privacy model: the backend stores ONLY the goal definition,
-- the combined total, and a names-only membership list.
-- Per-member submissions are never stored server-side.
-- See docs/SharedGoals-Design.md
-- ============================================================

-- Rooms: the shared goal + the combined contribution total
create table public.rooms (
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

create index rooms_code_idx on public.rooms (code);

-- Members: names only. Holds zero contribution data.
create table public.members (
  room_id    uuid not null references public.rooms (id) on delete cascade,
  user_id    uuid not null,
  name       text not null check (char_length(btrim(name)) between 1 and 24),
  joined_at  timestamptz not null default now(),
  removed_at timestamptz,
  primary key (room_id, user_id)
);

-- Idempotency ledger for increments. UUIDs only — no counts, no user ids.
-- Purged after 7 days by purge_expired().
create table public.applied_event_ids (
  event_id   uuid primary key,
  room_id    uuid not null references public.rooms (id) on delete cascade,
  applied_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Direct table writes are denied everywhere (no write policies);
-- all mutations go through security definer RPCs below.
-- ============================================================
alter table public.rooms enable row level security;
alter table public.members enable row level security;
alter table public.applied_event_ids enable row level security;

-- Goal definitions are readable (the app flow is code-gated).
create policy "rooms are readable" on public.rooms
  for select using (true);

-- The member list (names only) is readable by current members of that room.
create policy "members readable by room members" on public.members
  for select using (
    exists (
      select 1 from public.members m
      where m.room_id = room_id
        and m.user_id = auth.uid()
        and m.removed_at is null
    )
  );

-- applied_event_ids: no policies → unreadable and unwritable by clients.

-- ============================================================
-- Helpers
-- ============================================================

-- Unambiguous code alphabet: no 0/O/1/I/L.
create function public.random_room_code() returns text
language sql volatile as $$
  select array_to_string(
    array(
      select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 31)::int + 1, 1)
      from generate_series(1, 6)
    ),
    ''
  );
$$;

-- ============================================================
-- RPCs (all security definer; direct table access is denied)
-- ============================================================

create or replace function public.create_room(
  p_title text,
  p_zikr_name text,
  p_zikr_arabic text,
  p_target integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_name text
) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_room public.rooms;
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
    v_code := public.random_room_code();
    begin
      insert into public.rooms (code, title, zikr_name, zikr_arabic, target, starts_at, ends_at, owner_id)
      values (v_code, left(btrim(p_title), 80), left(btrim(p_zikr_name), 80), nullif(btrim(p_zikr_arabic), ''),
              p_target, p_starts_at, p_ends_at, v_uid)
      returning * into v_room;
      exit;
    exception when unique_violation then
      continue; -- code collision, try another
    end;
  end loop;

  insert into public.members (room_id, user_id, name)
  values (v_room.id, v_uid, left(btrim(p_name), 24));

  return json_build_object('room', public.get_room_state(v_room.code));
end;
$$;

create or replace function public.join_room(p_code text, p_name text)
returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_name is null or char_length(btrim(p_name)) = 0 then
    raise exception 'invalid_name';
  end if;

  select * into v_room from public.rooms where code = upper(btrim(coalesce(p_code, '')));
  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;
  if v_room.status <> 'active' then
    raise exception 'room_closed';
  end if;
  if now() > v_room.ends_at then
    raise exception 'window_ended';
  end if;
  if (select count(*) from public.members m where m.room_id = v_room.id and m.removed_at is null) >= 100 then
    raise exception 'room_full';
  end if;

  -- Join or rejoin (a returning member keeps a single row).
  insert into public.members (room_id, user_id, name)
  values (v_room.id, v_uid, left(btrim(p_name), 24))
  on conflict (room_id, user_id) do update
    set name = excluded.name, removed_at = null, joined_at = now();

  return public.get_room_state(v_room.code);
end;
$$;

-- Atomic, idempotent contribution increment. The ONLY way counts change.
create or replace function public.contribute(p_code text, p_delta integer, p_event_id uuid)
returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
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

  select * into v_room from public.rooms
  where code = upper(btrim(coalesce(p_code, ''))) and status = 'active'
  for update;
  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;
  if now() < v_room.starts_at then
    raise exception 'window_not_started';
  end if;
  if now() > v_room.ends_at then
    raise exception 'window_ended';
  end if;
  if not exists (
    select 1 from public.members m
    where m.room_id = v_room.id and m.user_id = v_uid and m.removed_at is null
  ) then
    raise exception 'not_a_member';
  end if;

  -- Idempotency: a retried event is acknowledged without re-applying.
  insert into public.applied_event_ids (event_id, room_id) values (p_event_id, v_room.id)
  on conflict (event_id) do nothing;
  if not found then
    select total into v_total from public.rooms where id = v_room.id;
    return json_build_object('total', v_total);
  end if;

  update public.rooms set total = total + p_delta where id = v_room.id
  returning total into v_total;

  return json_build_object('total', v_total);
end;
$$;

create or replace function public.get_room_state(p_code text)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where code = upper(btrim(coalesce(p_code, '')));
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
      from public.members m
      where m.room_id = v_room.id and m.removed_at is null
    ),
    'isMember', exists (
      select 1 from public.members m
      where m.room_id = v_room.id and m.user_id = v_uid and m.removed_at is null
    )
  );
end;
$$;

create or replace function public.remove_member(p_code text, p_user_id uuid)
returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where code = upper(btrim(coalesce(p_code, '')));
  if not found then raise exception 'room_not_found' using errcode = 'P0002'; end if;
  if v_room.owner_id <> v_uid then raise exception 'not_owner'; end if;

  update public.members set removed_at = now()
  where room_id = v_room.id and user_id = p_user_id and removed_at is null;
end;
$$;

create or replace function public.leave_room(p_code text)
returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  update public.members set removed_at = now()
  where user_id = v_uid and removed_at is null
    and room_id = (select id from public.rooms where code = upper(btrim(coalesce(p_code, ''))));
end;
$$;

create or replace function public.close_room(p_code text)
returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  update public.rooms set status = 'closed'
  where code = upper(btrim(coalesce(p_code, '')))
    and owner_id = v_uid
    and status = 'active';
  if not found then raise exception 'not_owner_or_not_found'; end if;
end;
$$;

-- Purge housekeeping: old event ids and long-ended rooms.
-- Run daily via pg_cron (below) or from the project keep-alive job.
create or replace function public.purge_expired()
returns void
language sql security definer set search_path = public as $$
  delete from public.applied_event_ids where applied_at < now() - interval '7 days';
  delete from public.rooms where ends_at < now() - interval '60 days';
$$;

-- Optional: schedule the purge with pg_cron (enable the extension in the
-- Supabase dashboard first), or call public.purge_expired() from the
-- project's keep-alive job.
-- select cron.schedule('zikr-purge-expired', '0 3 * * *', $$select public.purge_expired()$$);

grant execute on function public.create_room(text, text, text, integer, timestamptz, timestamptz, text) to anon, authenticated;
grant execute on function public.join_room(text, text) to anon, authenticated;
grant execute on function public.contribute(text, integer, uuid) to anon, authenticated;
grant execute on function public.get_room_state(text) to anon, authenticated;
grant execute on function public.remove_member(text, uuid) to anon, authenticated;
grant execute on function public.leave_room(text) to anon, authenticated;
grant execute on function public.close_room(text) to anon, authenticated;
