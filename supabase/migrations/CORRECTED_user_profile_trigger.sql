-- CORRECTED: Auto-create user profiles when users sign up
-- This matches your actual user_profiles table schema

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_type,
    display_name,
    username,
    avatar_url,
    gaming,
    stats,
    notifications,
    display,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    'fan',
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    '{
      "xbox_gamertag": null,
      "psn_id": null,
      "preferred_platform": "both",
      "experience_level": "beginner",
      "platform_verified": false
    }'::jsonb,
    '{
      "matches_played": 0,
      "win_rate": 0,
      "goals_per_game": 0
    }'::jsonb,
    '{
      "email": true,
      "push": true
    }'::jsonb,
    '{
      "theme": "system",
      "language": "en"
    }'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
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
  user_type,
  display_name,
  username,
  gaming,
  stats,
  notifications,
  display,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'fan' as user_type,
  au.raw_user_meta_data->>'full_name' as display_name,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  '{
    "xbox_gamertag": null,
    "psn_id": null,
    "preferred_platform": "both",
    "experience_level": "beginner",
    "platform_verified": false
  }'::jsonb as gaming,
  '{
    "matches_played": 0,
    "win_rate": 0,
    "goals_per_game": 0
  }'::jsonb as stats,
  '{
    "email": true,
    "push": true
  }'::jsonb as notifications,
  '{
    "theme": "system",
    "language": "en"
  }'::jsonb as display,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify the trigger works
SELECT 
  'Trigger created successfully!' as status,
  'Backfilled ' || (
    SELECT COUNT(*) FROM public.user_profiles
  ) || ' user profiles' as profiles_count; 