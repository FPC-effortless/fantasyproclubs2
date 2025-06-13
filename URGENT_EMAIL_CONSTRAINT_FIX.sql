-- URGENT FIX: User Profiles Email Constraint Issue
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Remove NOT NULL constraint from email column if it exists
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
        
        -- Update any existing profiles with null email
        UPDATE public.user_profiles 
        SET email = auth_users.email
        FROM auth.users auth_users
        WHERE user_profiles.id = auth_users.id 
        AND user_profiles.email IS NULL
        AND auth_users.email IS NOT NULL;
        
        RAISE NOTICE 'Updated existing profiles with missing emails';
        
    ELSE
        RAISE NOTICE 'Email column does not exist in user_profiles table';
    END IF;
END $$;

-- Step 2: Update the trigger function to handle email properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    email_column_exists boolean;
BEGIN
    -- Check if email column exists in user_profiles
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email' 
        AND table_schema = 'public'
    ) INTO email_column_exists;
    
    IF email_column_exists THEN
        -- Insert with email column
        INSERT INTO public.user_profiles (
            id,
            email,
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
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'user_type', 'fan'),
            COALESCE(NEW.raw_user_meta_data->'gaming', '{"psn_id": null, "xbox_gamertag": null, "experience_level": "beginner", "preferred_position": "any"}'::jsonb),
            '{"matches_played": 0, "goals_per_game": 0, "win_rate": 0}'::jsonb,
            '{"email": true, "push": true}'::jsonb,
            '{"theme": "system", "language": "en"}'::jsonb
        );
    ELSE
        -- Insert without email column (based on our earlier schema analysis)
        INSERT INTO public.user_profiles (
            id,
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
            COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'user_type', 'fan'),
            COALESCE(NEW.raw_user_meta_data->'gaming', '{"psn_id": null, "xbox_gamertag": null, "experience_level": "beginner", "preferred_position": "any"}'::jsonb),
            '{"matches_played": 0, "goals_per_game": 0, "win_rate": 0}'::jsonb,
            '{"email": true, "push": true}'::jsonb,
            '{"theme": "system", "language": "en"}'::jsonb
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Show current schema for verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 