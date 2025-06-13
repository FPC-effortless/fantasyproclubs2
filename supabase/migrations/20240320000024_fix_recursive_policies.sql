-- First, drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users on their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for users on their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable full access for admins" ON user_profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create a new admin flag column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update existing admin users
UPDATE user_profiles 
SET is_admin = true 
WHERE role = 'admin';

-- Create new, simplified policies that avoid recursion
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Enable self-service"
ON user_profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable admin access"
ON user_profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    )
);

-- Create or replace the function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role, is_admin)
    VALUES (
        new.id,
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM user_profiles) THEN 'admin'
            ELSE 'user'
        END,
        NOT EXISTS (SELECT 1 FROM user_profiles)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 