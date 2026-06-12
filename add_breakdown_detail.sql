-- Adds the per-category breakdown column used by the PDF report engine.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- The app writes an object (tonnes/yr) shaped like:
--   { cooking, homeEnergy, agBurning, transport, food, shopping, waste, digital,
--     flights, vehicle, diet, foodWaste }
-- The first eight keys are the report's display categories and sum to
-- total_emissions exactly. The app degrades gracefully if this column is
-- missing (the report recomputes the breakdown from answers_data), but adding
-- it freezes each report's numbers at submission time and avoids recomputation.

alter table public.calculator_submissions
  add column if not exists breakdown_detail jsonb;
