-- Fix for user_profiles email constraint issue
-- This script will remove the NOT NULL constraint on email column if it exists
-- and update the trigger to properly populate email from auth.users

-- First, let's check if email column exists and has NOT NULL constraint
DO $$ 
DECLARE 
    column_exists boolean;
    has_not_null_constraint boolean;
BEGIN
    -- Check if email column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email' 
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Email column exists in user_profiles table';
        
        -- Check if it has NOT NULL constraint
        SELECT is_nullable = 'NO' 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email' 
        AND table_schema = 'public'
        INTO has_not_null_constraint;
        
        IF has_not_null_constraint THEN
            RAISE NOTICE 'Removing NOT NULL constraint from email column';
            ALTER TABLE public.user_profiles ALTER COLUMN email DROP NOT NULL;
        ELSE
            RAISE NOTICE 'Email column already allows NULL values';
        END IF;
    ELSE
        RAISE NOTICE 'Email column does not exist in user_profiles table';
    END IF;
END $$;

-- Update or create the trigger function to properly handle email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email, -- Include email if column exists
    display_name,
    username,
    user_type,
    gaming,
    stats,
    notifications,
    display
  )
  VALUES (
    NEW.id,
    NEW.email, -- Get email from auth.users
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'fan'),
    COALESCE(NEW.raw_user_meta_data->'gaming', '{"psn_id": null, "xbox_gamertag": null, "experience_level": "beginner", "preferred_position": "any"}'::jsonb),
    '{"matches_played": 0, "goals_per_game": 0, "win_rate": 0}'::jsonb,
    '{"email": true, "push": true}'::jsonb,
    '{"theme": "system", "language": "en"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing user_profiles that have null email by updating from auth.users
UPDATE public.user_profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE user_profiles.id = auth_users.id 
AND user_profiles.email IS NULL
AND auth_users.email IS NOT NULL;

RAISE NOTICE 'User profiles email constraint and trigger have been fixed!'; 