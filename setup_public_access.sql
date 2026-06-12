-- ============================================================================
-- REQUIRED MIGRATION — run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste everything → Run).
--
-- Why: row-level security on calculator_submissions currently blocks EVERY
-- insert from the public site (the anon key), so finished check-ups, report
-- requests and donations never reach the database — that is why the admin
-- panel tabs stay empty. Anonymous reads are also blocked, so the live
-- "X completed a check-up" toasts never show real data.
--
-- This script:
--   1. Adds the new columns the app now writes:
--        account_name  — payer's bank account holder name (for verification)
--        email_sent    — admin tracks whether the detailed report was emailed
--   2. Replaces all RLS policies on calculator_submissions with:
--        - anon can INSERT rows only as 'general' (finished check-up) or
--          'pending' (report request / donation awaiting verification)
--        - anon can UPDATE only rows still in 'general'/'pending' state and
--          can never promote a row to 'verified'
--        - logged-in admins (authenticated role) keep full access
--        - anon can NOT select the table directly (emails/phones stay private)
--   3. Creates two SECURITY DEFINER functions that expose only safe data:
--        get_recent_activity() — first name + location + activity kind,
--                                powers the live toasts
--        get_public_stats()    — counters for the "N / 10,000" mission tracker
-- ============================================================================

-- 1. New columns -------------------------------------------------------------
alter table public.calculator_submissions
  add column if not exists account_name text;

alter table public.calculator_submissions
  add column if not exists email_sent boolean not null default false;

-- 1b. The quiz-completion flow writes payment_status = 'general'. If an old
-- CHECK constraint only allows pending/verified, drop it so those rows insert.
-- (Anon-writable values stay restricted to general/pending by the RLS policy
-- below, so removing the CHECK does not loosen what the public can write.)
do $$
declare
  con record;
begin
  for con in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'calculator_submissions'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%payment_status%'
  loop
    execute format('alter table public.calculator_submissions drop constraint %I', con.conname);
  end loop;
end $$;

-- 2. Row-level security ------------------------------------------------------
alter table public.calculator_submissions enable row level security;

-- Drop every existing policy on the table so the result is deterministic.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'calculator_submissions'
  loop
    execute format('drop policy %I on public.calculator_submissions', pol.policyname);
  end loop;
end $$;

-- Public site: finished check-ups insert as 'general'; report requests and
-- donations insert as 'pending'. Nothing else can be inserted anonymously.
create policy "anon_insert_public_submissions"
  on public.calculator_submissions
  for insert
  to anon
  with check (payment_status in ('general', 'pending'));

-- Public site: the report-request flow upgrades the user's own just-created
-- 'general' row to 'pending' (adds phone, payment method, account name).
-- Verified rows are locked — anon can never touch or create them.
create policy "anon_update_unverified_submissions"
  on public.calculator_submissions
  for update
  to anon
  using (payment_status in ('general', 'pending'))
  with check (payment_status in ('general', 'pending'));

-- Admin dashboard (email/password login → authenticated role): full access.
create policy "authenticated_full_access"
  on public.calculator_submissions
  for all
  to authenticated
  using (true)
  with check (true);

-- 3. Safe public read functions ----------------------------------------------
-- Live activity feed for the toasts. Exposes only a first name, a coarse
-- location and the kind of activity — never emails, phones or amounts.
create or replace function public.get_recent_activity()
returns table (first_name text, location text, kind text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select
    split_part(coalesce(nullif(trim(name), ''), 'Someone'), ' ', 1) as first_name,
    case when location in ('Earth', 'Donation/Support') then null else location end as location,
    case
      when location = 'Donation/Support' then 'support'
      when payment_status = 'verified' then 'verified'
      when payment_status in ('pending', 'paid', 'done') then 'report'
      else 'checkup'
    end as kind,
    created_at
  from public.calculator_submissions
  order by created_at desc
  limit 15;
$$;

-- Counters for the mission tracker on the calculator screen.
-- verified_reports counts people whose detailed-report payment was verified.
create or replace function public.get_public_stats()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'verified_reports', (
      select count(*) from public.calculator_submissions
      where payment_status = 'verified' and location is distinct from 'Donation/Support'
    ),
    'total_checkups', (
      select count(*) from public.calculator_submissions
      where location is distinct from 'Donation/Support'
    ),
    'supporters', (
      select count(*) from public.calculator_submissions
      where location = 'Donation/Support'
    )
  );
$$;

grant execute on function public.get_recent_activity() to anon, authenticated;
grant execute on function public.get_public_stats() to anon, authenticated;
