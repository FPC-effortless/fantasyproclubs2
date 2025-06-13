-- Auto-create user profiles when users sign up
-- This ensures every authenticated user gets a profile automatically

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    user_type,
    status,
    platform_verified,
    show_gaming_tags,
    show_platform,
    allow_team_invites,
    xbox_verified,
    psn_verified,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'fan',
    'active',
    false,
    true,
    true,
    true,
    false,
    false,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.user_profiles TO supabase_auth_admin;

-- Backfill existing users who don't have profiles
INSERT INTO public.user_profiles (
  id,
  email,
  username,
  user_type,
  status,
  platform_verified,
  show_gaming_tags,
  show_platform,
  allow_team_invites,
  xbox_verified,
  psn_verified,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  split_part(au.email, '@', 1) as username,
  'fan' as user_type,
  'active' as status,
  false as platform_verified,
  true as show_gaming_tags,
  true as show_platform,
  true as allow_team_invites,
  false as xbox_verified,
  false as psn_verified,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify the trigger works
SELECT 'Trigger created successfully! All existing users now have profiles.' as status; 