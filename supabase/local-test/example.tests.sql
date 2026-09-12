-- ============================================================
-- EXAMPLE: behavioral tests for the schema, run as the client roles.
--
-- Usage (from supabase/):
--   docker compose up -d --wait
--   docker compose exec -T db psql -U postgres -d zikr_local \
--     -v ON_ERROR_STOP=1 < local-test/example.tests.sql
--
-- The pattern: impersonate a device by setting the JWT claims GUC, then
-- SET ROLE authenticated — RLS policies and security invoker RPCs now
-- behave exactly as they would through PostgREST. Works for triggers too.
-- This file is tied to the current schema shape; update it as the
-- migrations evolve (or keep per-feature test files alongside it).
-- ============================================================

-- 0. Seed test identities (as postgres; auth.users is the FK target for
--    devices.user_id). Test users are fixed UUIDs so claims can reference them.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

set role authenticated;

---------------------------------------------------------------
-- 1. Device token + track_event (U1)
---------------------------------------------------------------
do $$
declare
  v_token text;
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

  v_token := public.get_or_create_device_token();
  if char_length(v_token) <> 12 then raise exception 'FAIL: token length %', v_token; end if;
  -- Second call returns the same token (issued once per device).
  if public.get_or_create_device_token() <> v_token then raise exception 'FAIL: token not stable'; end if;

  perform public.track_event('app_opened');
  raise notice 'OK device token + track_event';
end $$;

---------------------------------------------------------------
-- 2. create_room: shape, membership (U1)
---------------------------------------------------------------
do $$
declare
  r jsonb;
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

  r := public.create_room('Test Room', 'Alhamdulillah', 'ٱلْحَمْدُ لِلَّٰهِ', 100,
                          now() - interval '1 hour', now() + interval '1 day', 'Ahmed');

  -- Single wrap: {room, members, isMember} — no legacy double 'room'.
  if (r -> 'room' ->> 'code') is null then raise exception 'FAIL: no room.code'; end if;
  if (r -> 'room' -> 'room') is not null then raise exception 'FAIL: double-wrapped payload'; end if;
  if (r ->> 'isMember')::boolean is not true then raise exception 'FAIL: creator not member'; end if;
  if jsonb_array_length(r -> 'members') <> 1 then raise exception 'FAIL: expected 1 member'; end if;
  if (r -> 'members' -> 0 ->> 'name') <> 'Ahmed' then raise exception 'FAIL: member name'; end if;
  if (r -> 'room' ->> 'zikrName') <> 'Alhamdulillah' then raise exception 'FAIL: zikr name'; end if;
  if (r -> 'room' ->> 'total')::int <> 0 then raise exception 'FAIL: initial total'; end if;

  perform set_config('app.test_code', r -> 'room' ->> 'code', false);
  raise notice 'OK create_room (%s)', r -> 'room' ->> 'code';
end $$;

---------------------------------------------------------------
-- 3. contribute: apply, idempotent replay, validation (U1)
---------------------------------------------------------------
do $$
declare
  v_code text := current_setting('app.test_code');
  v_total integer;
  -- Fresh per run: the replay check below calls contribute twice with the
  -- same id; a fixed literal would collide with earlier runs of this file.
  ev1 uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

  v_total := (public.contribute(v_code, 10, ev1) ->> 'total')::int;
  if v_total <> 10 then raise exception 'FAIL: expected total 10, got %', v_total; end if;

  -- Replay of the same event id must not double-apply.
  v_total := (public.contribute(v_code, 10, ev1) ->> 'total')::int;
  if v_total <> 10 then raise exception 'FAIL: replay changed total to %', v_total; end if;

  -- Validation errors surface with the app's codes.
  begin
    perform public.contribute(v_code, 0, gen_random_uuid());
    raise exception 'FAIL: zero delta accepted';
  exception when others then
    if sqlerrm <> 'invalid_delta' then raise exception 'FAIL: expected invalid_delta, got "%"', sqlerrm; end if;
  end;

  begin
    perform public.contribute('NOPE', 5, gen_random_uuid());
    raise exception 'FAIL: unknown room accepted';
  exception when others then
    if sqlerrm <> 'room_not_found' then raise exception 'FAIL: expected room_not_found, got "%"', sqlerrm; end if;
  end;

  raise notice 'OK contribute (apply, replay, validation)';
end $$;

---------------------------------------------------------------
-- 4. join_room + multi-member contribute (U2)
---------------------------------------------------------------
do $$
declare
  v_code text := current_setting('app.test_code');
  r jsonb;
  v_total integer;
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);

  r := public.join_room(v_code, 'Bilal');
  if (r ->> 'isMember')::boolean is not true then raise exception 'FAIL: joiner not member'; end if;
  if jsonb_array_length(r -> 'members') <> 2 then raise exception 'FAIL: expected 2 members'; end if;

  v_total := (public.contribute(v_code, 33, gen_random_uuid()) ->> 'total')::int;
  if v_total <> 43 then raise exception 'FAIL: expected total 43, got %', v_total; end if;

  raise notice 'OK join_room + member contribute';
end $$;

---------------------------------------------------------------
-- 5. Membership / ownership enforcement
---------------------------------------------------------------
do $$
declare
  v_code text := current_setting('app.test_code');
  r2 jsonb;
  v_code2 text;
begin
  -- U1 creates a second room; U2 (non-member) must be rejected by it.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);
  r2 := public.create_room('Room 2', 'SubhanAllah', null, 50,
                           now() - interval '1 hour', now() + interval '1 day', 'A');
  v_code2 := r2 -> 'room' ->> 'code';

  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);
  begin
    perform public.contribute(v_code2, 5, gen_random_uuid());
    raise exception 'FAIL: non-member could contribute';
  exception when others then
    if sqlerrm <> 'not_a_member' then raise exception 'FAIL: expected not_a_member, got "%"', sqlerrm; end if;
  end;

  -- Non-owner cannot close.
  begin
    perform public.close_room(v_code2);
    raise exception 'FAIL: non-owner closed the room';
  exception when others then
    if sqlerrm <> 'not_owner_or_not_found' then raise exception 'FAIL: expected not_owner_or_not_found, got "%"', sqlerrm; end if;
  end;

  -- Owner closes; then the room is un-contributeable.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);
  perform public.close_room(v_code2);
  if (public.get_room_state(v_code2) -> 'room' ->> 'status') <> 'closed' then
    raise exception 'FAIL: room not closed';
  end if;
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);
  begin
    perform public.contribute(v_code2, 5, gen_random_uuid());
    raise exception 'FAIL: contributed to closed room';
  exception when others then
    if sqlerrm <> 'room_not_found' then raise exception 'FAIL: expected room_not_found after close, got "%"', sqlerrm; end if;
  end;

  raise notice 'OK membership/ownership/close enforcement';
end $$;

---------------------------------------------------------------
-- 6. leave_room, remove_member, RLS visibility
---------------------------------------------------------------
do $$
declare
  v_code text := current_setting('app.test_code');
  r jsonb;
  v_n int;
begin
  -- U2 leaves the main room.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);
  perform public.leave_room(v_code);
  r := public.get_room_state(v_code);
  -- Non-members no longer see the roster (RLS) — they see isMember=false.
  if (r ->> 'isMember')::boolean then raise exception 'FAIL: leaver still member'; end if;
  -- The owner still sees the shrunken roster.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);
  r := public.get_room_state(v_code);
  if jsonb_array_length(r -> 'members') <> 1 then raise exception 'FAIL: leave did not shrink roster'; end if;

  -- Back as U2: no longer a member, cannot contribute.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);
  begin
    perform public.contribute(v_code, 5, gen_random_uuid());
    raise exception 'FAIL: leaver contributed';
  exception when others then
    if sqlerrm <> 'not_a_member' then raise exception 'FAIL: expected not_a_member after leave, got "%"', sqlerrm; end if;
  end;

  -- U2 rejoins; owner removes them.
  perform public.join_room(v_code, 'Bilal');
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);
  perform public.remove_member(v_code, '00000000-0000-0000-0000-000000000002');
  select jsonb_array_length((public.get_room_state(v_code) -> 'members')::jsonb) into v_n;
  if v_n <> 1 then raise exception 'FAIL: removed member still listed (%s)', v_n; end if;

  -- Non-owner cannot remove members.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002"}', false);
  begin
    perform public.remove_member(v_code, '00000000-0000-0000-0000-000000000001');
    raise exception 'FAIL: non-owner removed a member';
  exception when others then
    if sqlerrm <> 'not_owner' then raise exception 'FAIL: expected not_owner, got "%"', sqlerrm; end if;
  end;

  raise notice 'OK leave/remove flows';
end $$;

---------------------------------------------------------------
-- 7. Privilege surface: what a client can and cannot touch
---------------------------------------------------------------
do $$
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

  -- RLS member visibility: a policy self-query must not recurse, and a
  -- member sees their room's roster rows.
  if (select count(*) from zikr_app.members) < 1 then raise exception 'FAIL: member sees no roster rows'; end if;

  -- Analytics are insert-only: no select grant.
  begin
    perform count(*) from zikr_app.analytics_events;
    raise exception 'FAIL: client read analytics_events';
  exception when insufficient_privilege then
    null; -- expected
  end;

  -- Purge is service-role only.
  begin
    perform public.purge_expired();
    raise exception 'FAIL: client called purge_expired';
  exception when insufficient_privilege then
    null; -- expected
  end;

  raise notice 'OK privilege surface';
end $$;

---------------------------------------------------------------
-- 8. service_role can purge
---------------------------------------------------------------
set role service_role;
do $$
begin
  perform public.purge_expired();
  raise notice 'OK service_role purge';
end $$;

reset role;
select 'ALL TESTS PASSED' as result;
