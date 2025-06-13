-- Fix user_profiles RLS policies for public access
-- Date: 2024-12-01
-- Purpose: Ensure user_profiles can be read publicly for player information

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "user_profiles_public_read_access" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- Create a comprehensive public read policy
CREATE POLICY "user_profiles_allow_public_read"
ON user_profiles FOR SELECT
USING (true);

-- Ensure basic write policies exist for authenticated users
DROP POLICY IF EXISTS "user_profiles_own_update" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_insert" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

CREATE POLICY "user_profiles_own_update"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_own_insert"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid()); 