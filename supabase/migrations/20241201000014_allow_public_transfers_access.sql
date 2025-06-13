-- Allow public access to transfers for competition viewing
-- Date: 2024-12-01
-- Purpose: Enable public viewing of transfers screen without authentication

-- Enable RLS on transfers table (might already be enabled)
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies for transfers table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON transfers;
DROP POLICY IF EXISTS "Anyone can view transfers" ON transfers;
DROP POLICY IF EXISTS "Transfers are viewable by everyone" ON transfers;
DROP POLICY IF EXISTS "transfers_public_read" ON transfers;
DROP POLICY IF EXISTS "Allow authenticated users to manage transfers" ON transfers;

-- Create new public read policy for transfers
CREATE POLICY "transfers_public_read_access"
ON transfers FOR SELECT
USING (true);

-- Grant permissions (in case they don't exist)
GRANT SELECT ON transfers TO anon;

-- Log the completion
SELECT 'Public access to transfers has been enabled' as message; 