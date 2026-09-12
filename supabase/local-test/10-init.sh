#!/bin/bash
# Docker postgres init hook (runs once, on first boot with an empty volume).
# Applies the Supabase-like test environment, then every migration in order.
set -e

echo ">>> local-test: applying Supabase-like environment"
psql -v ON_ERROR_STOP=1 -U postgres -d "$POSTGRES_DB" \
  -f /opt/local-test/20-supabase-env.sql

echo ">>> local-test: applying migrations"
for f in /migrations/*.sql; do
  echo ">>> local-test: $f"
  psql -v ON_ERROR_STOP=1 -U postgres -d "$POSTGRES_DB" -f "$f"
done

echo ">>> local-test: ready — connect with: psql 'postgres://postgres:postgres@localhost:55433/zikr_local'"
