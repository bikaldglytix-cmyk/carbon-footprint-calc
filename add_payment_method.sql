-- Adds the payment method column used by the donation / report-request flows.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Values written by the app:
--   'fonepay' — paid via the Fonepay QR
--   'bank'    — paid via direct bank transfer (Sanima Bank; foreign donors via SWIFT)
-- Older rows submitted before this change will be NULL (shown as "—" in the admin panel).

alter table public.calculator_submissions
  add column if not exists payment_method text;
