-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.teams
    DROP CONSTRAINT IF EXISTS teams_manager_id_fkey;

-- Add proper foreign key constraint with ON DELETE SET NULL
ALTER TABLE public.teams
    ADD CONSTRAINT teams_manager_id_fkey
    FOREIGN KEY (manager_id)
    REFERENCES public.user_profiles(id)
    ON DELETE SET NULL;

-- Create a policy to allow authenticated users to read teams
CREATE POLICY "Allow authenticated users to read teams"
    ON public.teams
    FOR SELECT
    TO authenticated
    USING (true);

-- Enable RLS on teams table if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.teams TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated; 