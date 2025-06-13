-- Fix user_profiles RLS policies for admin access
-- Date: 2024-04-01

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable update for own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable admin access" ON "public"."user_profiles";

-- Create policies for user_profiles
-- Allow all authenticated users to read user profiles (needed for team management)
CREATE POLICY "Enable read access for authenticated users"
ON "public"."user_profiles"
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update for own profile"
ON "public"."user_profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins full access
CREATE POLICY "Enable admin full access"
ON "public"."user_profiles"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.user_type = 'admin'
    )
);

-- Allow insert for new user registration (this policy might be needed for auth triggers)
CREATE POLICY "Enable insert for new users"
ON "public"."user_profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id); 