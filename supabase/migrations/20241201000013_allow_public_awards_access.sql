-- Allow public access to awards and trophies for competition viewing
-- Date: 2024-12-01
-- Purpose: Enable public viewing of awards screen without authentication

-- Enable RLS on awards table (might already be enabled)
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies for awards table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON awards;
DROP POLICY IF EXISTS "Anyone can view awards" ON awards;
DROP POLICY IF EXISTS "Awards are viewable by everyone" ON awards;
DROP POLICY IF EXISTS "awards_public_read" ON awards;
DROP POLICY IF EXISTS "Allow authenticated users to manage awards" ON awards;

-- Create new public read policy for awards
CREATE POLICY "awards_public_read_access"
ON awards FOR SELECT
USING (true);

-- Enable RLS on trophies table (might already be enabled)
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies for trophies table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON trophies;
DROP POLICY IF EXISTS "Anyone can view trophies" ON trophies;
DROP POLICY IF EXISTS "Trophies are viewable by everyone" ON trophies;
DROP POLICY IF EXISTS "trophies_public_read" ON trophies;

-- Create new public read policy for trophies
CREATE POLICY "trophies_public_read_access"
ON trophies FOR SELECT
USING (true);

-- Note: trophy_awards table doesn't exist in this database
-- Only working with trophies table

-- Grant permissions (in case they don't exist)
GRANT SELECT ON awards TO anon;
GRANT SELECT ON trophies TO anon;

-- Log the completion
SELECT 'Public access to awards and trophies has been enabled' as message; 