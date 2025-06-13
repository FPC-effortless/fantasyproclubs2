-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for viewing user profiles (anyone can view)
CREATE POLICY "Enable read access for all authenticated users"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy for updating own profile
CREATE POLICY "Enable update for users based on user_id"
ON user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy for inserting own profile
CREATE POLICY "Enable insert for users based on user_id"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()); 