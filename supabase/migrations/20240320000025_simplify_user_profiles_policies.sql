-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users on their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for users on their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable full access for admins" ON user_profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Temporarily disable RLS to ensure we can reset everything
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies possible
CREATE POLICY "Allow select for all" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow update for users own rows" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow delete for users own rows" 
ON user_profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id); 