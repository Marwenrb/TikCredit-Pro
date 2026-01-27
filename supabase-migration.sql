-- ═══════════════════════════════════════════════════════════════════════════════
-- TikCredit Pro - Supabase Database Setup
-- ═══════════════════════════════════════════════════════════════════════════════
-- Execute this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Form data / بيانات النموذج
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  wilaya TEXT NOT NULL,
  profession TEXT,
  custom_profession TEXT,
  monthly_income_range TEXT,
  salary_receive_method TEXT NOT NULL,
  financing_type TEXT NOT NULL,
  requested_amount BIGINT NOT NULL,
  is_existing_customer TEXT,
  preferred_contact_time TEXT,
  notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'web-form',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Backup tracking
  last_backup_at TIMESTAMPTZ,
  backup_count INTEGER DEFAULT 0
);

-- Enable Row Level Security (required for secure access)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for server-side operations)
-- Note: The service_role key bypasses RLS, so this policy is mainly for documentation
CREATE POLICY "Service role has full access" ON submissions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
CREATE INDEX IF NOT EXISTS idx_submissions_wilaya ON submissions(wilaya);

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_updated_at ON submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Utility Functions
-- ═══════════════════════════════════════════════════════════════════════════════

-- Get daily statistics
CREATE OR REPLACE FUNCTION get_daily_stats(for_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_count BIGINT,
  total_amount BIGINT,
  by_status JSONB,
  by_wilaya JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_count,
    COALESCE(SUM(requested_amount), 0)::BIGINT as total_amount,
    jsonb_object_agg(
      COALESCE(status, 'unknown'), 
      status_count
    ) as by_status,
    jsonb_object_agg(
      COALESCE(wilaya, 'unknown'), 
      wilaya_count
    ) as by_wilaya
  FROM (
    SELECT status, COUNT(*) as status_count
    FROM submissions 
    WHERE DATE(created_at) = for_date
    GROUP BY status
  ) status_data,
  (
    SELECT wilaya, COUNT(*) as wilaya_count
    FROM submissions 
    WHERE DATE(created_at) = for_date
    GROUP BY wilaya
  ) wilaya_data;
END;
$$ LANGUAGE plpgsql;

-- Get backup data for export
CREATE OR REPLACE FUNCTION get_backup_data()
RETURNS TABLE (
  backup_json JSONB,
  backup_date TIMESTAMPTZ,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(jsonb_agg(row_to_json(s)::jsonb), '[]'::jsonb) as backup_json,
    NOW() as backup_date,
    COUNT(*) as total_count
  FROM submissions s;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Verification
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check if table was created successfully
SELECT 
  'Table created successfully!' as status,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'submissions';
