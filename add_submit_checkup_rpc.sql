-- ============================================================================
-- REQUIRED MIGRATION — run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste everything → Run).
--
-- Why: RLS lets the public site (anon key) INSERT into calculator_submissions
-- but — deliberately, to keep emails/phones private — not SELECT from it.
-- The quiz-completion flow inserted with RETURNING (.insert().select()) to
-- learn the new row's id, and Postgres rejects the whole statement when the
-- returned row isn't visible. Result: finished check-ups were never saved,
-- so the admin panel's "All Users" tab stayed empty.
--
-- This SECURITY DEFINER function performs the insert and hands back only the
-- new row's id. The table itself stays unreadable to the public, and the
-- function always writes payment_status = 'general' so anonymous callers
-- can't use it to forge pending/verified rows.
-- ============================================================================

-- The function writes breakdown_detail; make sure the column exists
-- (no-op if add_breakdown_detail.sql already ran).
alter table public.calculator_submissions
  add column if not exists breakdown_detail jsonb;

create or replace function public.submit_checkup(
  p_name text,
  p_email text,
  p_location text,
  p_total numeric,
  p_home numeric,
  p_transport numeric,
  p_food numeric,
  p_goods numeric,
  p_answers jsonb,
  p_breakdown jsonb
) returns bigint
language sql
security definer
set search_path = public
as $$
  insert into public.calculator_submissions
    (name, email, location, total_emissions,
     breakdown_home, breakdown_transport, breakdown_food, breakdown_goods,
     answers_data, breakdown_detail, payment_status)
  values
    (p_name, p_email, p_location, p_total,
     p_home, p_transport, p_food, p_goods,
     p_answers, p_breakdown, 'general')
  returning id;
$$;

grant execute on function public.submit_checkup(
  text, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, jsonb
) to anon, authenticated;

-- Remove the connectivity-test row created while diagnosing this bug.
delete from public.calculator_submissions where name = 'TEST_CLAUDE_DELETE_ME';
