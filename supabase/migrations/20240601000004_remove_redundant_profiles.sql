-- Step 1: Migrate any missing data from profiles to user_profiles
INSERT INTO user_profiles (id, user_type, display_name, username, avatar_url)
SELECT 
    p.id,
    p.user_type,  -- Already has the correct values (admin, manager, player, fan)
    p.full_name as display_name,
    p.username,
    p.avatar_url
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = p.id
)
ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    display_name = EXCLUDED.display_name,
    username = COALESCE(user_profiles.username, EXCLUDED.username),
    avatar_url = COALESCE(user_profiles.avatar_url, EXCLUDED.avatar_url);

-- Step 2: Drop the trigger for automatically creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Drop the profiles table and its policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP TABLE IF EXISTS profiles;

-- Step 4: Remove the empty migration file by replacing it with a comment
-- Note: We can't actually delete the file as it might have been applied in some environments,
-- but we can ensure it does nothing
COMMENT ON SCHEMA public IS 'Migration 20240601000002_add_user_settings.sql has been deprecated as its functionality is included in user_profiles table'; 