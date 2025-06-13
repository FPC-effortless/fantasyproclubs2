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

-- Create base policies for user_profiles first
CREATE POLICY "User profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Create a special admin policy for user_profiles that doesn't reference itself
CREATE POLICY "Admins can manage all profiles"
ON user_profiles FOR ALL
TO authenticated
USING (
    -- Instead of querying user_profiles, we use a direct role check
    role = 'admin'
); 