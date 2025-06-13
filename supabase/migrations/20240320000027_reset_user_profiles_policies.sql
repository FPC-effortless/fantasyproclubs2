-- First, drop all existing policies
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', policy_name);
    END LOOP;
END $$;

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add only a single, simple read policy
CREATE POLICY "Enable read access for all authenticated users"
ON user_profiles FOR SELECT
TO authenticated
USING (true); 