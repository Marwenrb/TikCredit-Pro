-- ═══════════════════════════════════════════════════════════════════════════════
-- TikCredit Pro — Banking Details Migration
-- Run this in Supabase Dashboard → SQL Editor BEFORE deploying code changes
-- All columns are nullable — non-breaking for existing data
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add banking columns to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ccp_number TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ccp_key TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ccp_full_number TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bank_agency_code TEXT;

-- Backfill payment_method from existing salary_receive_method for old rows
UPDATE submissions
SET payment_method = salary_receive_method
WHERE payment_method IS NULL AND salary_receive_method IS NOT NULL;

-- Add index on payment_method for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_payment_method ON submissions(payment_method);
