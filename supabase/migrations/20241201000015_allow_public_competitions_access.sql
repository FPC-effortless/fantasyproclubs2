-- Allow public access to competitions for homepage viewing
-- Date: 2024-12-01
-- Purpose: Enable public viewing of competitions on homepage without authentication

-- Enable RLS on competitions table (might already be enabled)
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies for competitions table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON competitions;
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Competitions are viewable by everyone" ON competitions;
DROP POLICY IF EXISTS "competitions_public_read" ON competitions;
DROP POLICY IF EXISTS "Allow public read access to competitions" ON competitions;

-- Create new public read policy for competitions
DO $$ 
BEGIN
    -- Check if the policy doesn't already exist before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'competitions' 
        AND policyname = 'competitions_public_read_access'
    ) THEN
        CREATE POLICY "competitions_public_read_access" ON "public"."competitions"
        AS PERMISSIVE FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- Grant permissions (in case they don't exist)
GRANT SELECT ON competitions TO anon;

-- Log the completion
SELECT 'Public access to competitions has been enabled' as message; 