-- Add team selection support to user_profiles table
-- Run this in Supabase SQL Editor

-- Add team_id column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_team_id ON public.user_profiles(team_id);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.team_id IS 'The team the user follows/supports - selected during signup';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name = 'team_id'; 