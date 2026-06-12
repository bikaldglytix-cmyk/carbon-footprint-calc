-- Adds the currency column for multi-currency support in the donation / report-request flows.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Values written by the app:
--   'NPR'  — Nepalese Rupee (default)
--   'INR'  — Indian Rupee
--   'USD'  — US Dollar
--   'EUR'  — Euro
-- Older rows submitted before this change will be NULL (defaults to NPR in the UI).

alter table public.calculator_submissions
  add column if not exists currency text default 'NPR';
