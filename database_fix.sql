-- Fix featured_content table permissions
-- Option 1: Disable RLS (simplest solution)
ALTER TABLE featured_content DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies (more secure)
-- Uncomment these lines if you prefer to keep RLS enabled:

-- DROP POLICY IF EXISTS "Admin users can manage featured content" ON featured_content;
-- CREATE POLICY "Admin users can manage featured content" ON featured_content
--   FOR ALL USING (
--     auth.jwt() ->> 'user_metadata' ->> 'user_type' = 'admin' OR
--     auth.jwt() ->> 'app_metadata' ->> 'user_type' = 'admin'
--   );

-- DROP POLICY IF EXISTS "Public can view featured content" ON featured_content;
-- CREATE POLICY "Public can view featured content" ON featured_content
--   FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON featured_content TO authenticated;
GRANT ALL ON featured_content TO anon; 