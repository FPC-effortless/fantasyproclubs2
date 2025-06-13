-- Fix user profile creation trigger for signup
-- Date: 2024-12-20
-- Purpose: Ensure user profiles are created automatically on signup with favorite team support

-- First, add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email TEXT;
  END IF;

  -- Add display_name column if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
  END IF;

  -- Ensure user_type column has proper default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN user_type SET DEFAULT 'fan';
  END IF;

  -- Ensure username column has proper default  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN username SET DEFAULT '';
  END IF;

  -- Ensure team_id column exists for favorite team support
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update the trigger function to handle favorite team selection
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile with data from signup form
    INSERT INTO public.user_profiles (
        id, 
        user_type, 
        display_name, 
        username, 
        avatar_url,
        team_id,
        gaming,
        stats,
        notifications,
        display
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'fan'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
                AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
            THEN CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name')
            ELSE COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
        END,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        -- Handle favorite team selection
        CASE 
            WHEN NEW.raw_user_meta_data->>'favorite_team_id' IS NOT NULL 
                AND NEW.raw_user_meta_data->>'favorite_team_id' != ''
            THEN (NEW.raw_user_meta_data->>'favorite_team_id')::UUID
            ELSE NULL
        END,
        -- Gaming preferences with platform data
        JSONB_BUILD_OBJECT(
            'xbox_gamertag', NEW.raw_user_meta_data->>'xbox_gamertag',
            'psn_id', NEW.raw_user_meta_data->>'psn_id',
            'preferred_platform', COALESCE(NEW.raw_user_meta_data->>'preferred_platform', 'both'),
            'experience_level', COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner'),
            'platform_verified', COALESCE((NEW.raw_user_meta_data->>'platform_verified')::boolean, false)
        ),
        -- Default stats
        JSONB_BUILD_OBJECT(
            'matches_played', 0,
            'win_rate', 0,
            'goals_per_game', 0
        ),
        -- Notification preferences
        JSONB_BUILD_OBJECT(
            'email', true,
            'push', true
        ),
        -- Display preferences
        JSONB_BUILD_OBJECT(
            'theme', 'dark',
            'language', 'en'
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        -- Update existing profile with new data if needed
        user_type = COALESCE(NEW.raw_user_meta_data->>'user_type', user_profiles.user_type),
        team_id = CASE 
            WHEN NEW.raw_user_meta_data->>'favorite_team_id' IS NOT NULL 
                AND NEW.raw_user_meta_data->>'favorite_team_id' != ''
            THEN (NEW.raw_user_meta_data->>'favorite_team_id')::UUID
            ELSE user_profiles.team_id
        END,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, do nothing
        RETURN NEW;
    WHEN OTHERS THEN
        -- If that fails, try with minimal data
        BEGIN
            INSERT INTO public.user_profiles (id, user_type)
            VALUES (NEW.id, 'fan')
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't fail the user creation
                RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        END;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Add a policy to allow service role to insert profiles (for the trigger)
DROP POLICY IF EXISTS "service_role_user_profiles_insert" ON user_profiles;
CREATE POLICY "service_role_user_profiles_insert"
ON user_profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Ensure authenticated users can also insert their own profile as fallback
DROP POLICY IF EXISTS "user_profiles_own_insert" ON user_profiles;
CREATE POLICY "user_profiles_own_insert"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT INSERT ON user_profiles TO service_role;
GRANT UPDATE ON user_profiles TO service_role; 