-- =============================================================================
-- FIX PLAYER RELATIONSHIPS - EA FC Pro Clubs App
-- Run this after fixing fantasy tables to resolve join issues
-- =============================================================================

-- Fix user_profiles table structure (ensure proper column names)
DO $$
BEGIN
    -- Check if display_name column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
        -- Copy data from display_name or username if it exists
        UPDATE public.user_profiles 
        SET display_name = COALESCE(display_name, username, 'Unknown User')
        WHERE display_name IS NULL;
    END IF;

    -- Ensure avatar_url column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END
$$;

-- Update any NULL display_names
UPDATE public.user_profiles 
SET display_name = COALESCE(display_name, username, 'Player ' || SUBSTRING(id::text, 1, 8))
WHERE display_name IS NULL OR display_name = '';

-- Success message
SELECT 'Player relationships fixed successfully! Fantasy queries should now work properly.' as message;
