-- ═══════════════════════════════════════════════════════════════════════════════
-- TikCredit Pro - Supabase Data Cleanup Script
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: View corrupted rows (rows with user-agent strings in full_name)
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT id, full_name, phone, wilaya, created_at 
FROM submissions 
WHERE full_name LIKE '%AppleWebKit%' 
   OR full_name LIKE '%Mozilla%'
   OR full_name LIKE '%Chrome%'
   OR full_name LIKE '%Safari%'
   OR phone LIKE '%AppleWebKit%';

-- Step 2: Delete corrupted rows (after verifying Step 1 results)
-- ═══════════════════════════════════════════════════════════════════════════════
DELETE FROM submissions 
WHERE full_name LIKE '%AppleWebKit%' 
   OR full_name LIKE '%Mozilla%'
   OR full_name LIKE '%Chrome%'
   OR full_name LIKE '%Safari%'
   OR phone LIKE '%AppleWebKit%';

-- Step 3: Verify clean data remains
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT id, full_name, phone, wilaya, financing_type, requested_amount, created_at 
FROM submissions 
ORDER BY created_at DESC 
LIMIT 20;

-- Step 4: Get summary statistics
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT 
    COUNT(*) as total_submissions,
    COUNT(DISTINCT wilaya) as unique_wilayas,
    SUM(requested_amount) as total_amount,
    AVG(requested_amount) as avg_amount,
    MIN(created_at) as oldest_submission,
    MAX(created_at) as newest_submission
FROM submissions;
