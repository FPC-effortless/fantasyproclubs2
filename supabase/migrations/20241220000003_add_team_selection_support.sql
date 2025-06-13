-- =============================================================================
-- ADD TEAM SELECTION SUPPORT - EA FC Pro Clubs App
-- Date: 2024-12-20
-- Purpose: Ensure team_id field exists in user_profiles for signup team selection
-- =============================================================================

-- Ensure team_id column exists in user_profiles table
DO $$ 
BEGIN
    -- Check if team_id column exists and add it if not
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'team_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added team_id column to user_profiles table';
    ELSE
        RAISE NOTICE 'team_id column already exists in user_profiles table';
    END IF;
END $$;

-- Create an index on team_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_team_id ON public.user_profiles(team_id);

-- Update database types to reflect the new column (this is for TypeScript types)
COMMENT ON COLUMN public.user_profiles.team_id IS 'The team the user follows/supports';

-- Ensure RLS policies allow users to update their team preference
DO $$
BEGIN
    -- Check if the policy exists and drop it if it does
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can update their own profile'
        AND schemaname = 'public'
    ) THEN
        DROP POLICY "Users can update their own profile" ON public.user_profiles;
    END IF;
    
    -- Create the policy that allows users to update their own profile including team_id
    CREATE POLICY "Users can update their own profile"
        ON public.user_profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
        
    RAISE NOTICE 'Updated RLS policy for user profile updates including team selection';
END $$;

-- Grant necessary permissions for team selection
GRANT SELECT ON public.teams TO authenticated;

RAISE NOTICE 'Team selection support has been added successfully!'; 