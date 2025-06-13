-- Drop existing policies on user_profiles to avoid conflicts
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON user_profiles;

-- Ensure user_profiles has RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for user_profiles
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Enable update for users on their own profiles"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Enable delete for users on their own profiles"
ON user_profiles FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Create admin policy for full access
CREATE POLICY "Enable full access for admins"
ON user_profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Ensure the id column is properly set up
ALTER TABLE user_profiles 
ALTER COLUMN id SET DEFAULT auth.uid(),
ALTER COLUMN id SET NOT NULL;

-- Add trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 