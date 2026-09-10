-- ============================================================
-- Hardening: clients talk to this database ONLY through the
-- security-definer RPCs. Identity is always derived from the signed
-- Supabase JWT (auth.uid()) — the client can never set or choose an
-- identity key. These revokes are defense in depth on top of RLS:
-- even a future RLS policy mistake keeps tables opaque to clients.
-- ============================================================

revoke all on public.rooms from anon, authenticated;
revoke all on public.members from anon, authenticated;
revoke all on public.applied_event_ids from anon, authenticated;
revoke all on public.devices from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;

-- Harden track_event: a strict name format and a payload size cap keep the
-- metrics table from becoming a free-form storage dump. Invalid events are
-- silently dropped — tracking is best-effort by contract.
create or replace function public.track_event(p_name text, p_properties jsonb default '{}')
returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text;
begin
  -- Validate before anything else.
  if p_name is null or p_name !~ '^[a-z][a-z0-9_]{0,39}$' then
    return;
  end if;
  if p_properties is null or pg_column_size(p_properties) > 2048 then
    return;
  end if;
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
  values (v_token, p_name, p_properties);
end;
$$;
