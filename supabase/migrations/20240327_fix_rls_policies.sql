-- First, disable RLS on all tables
ALTER TABLE IF EXISTS "public"."user_profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."stat_point_rules" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."fantasy_seasons" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competition_teams" DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable update for own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable full access for admins" ON "public"."competition_teams";

-- Drop any other policies that might exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('user_profiles', 'competitions', 'stat_point_rules', 'fantasy_seasons')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create policies for competition_teams
CREATE POLICY "Enable read access for all users"
ON "public"."competition_teams"
FOR SELECT
USING (true);

CREATE POLICY "Enable full access for admins"
ON "public"."competition_teams"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- Create helper function for competition teams management
CREATE OR REPLACE FUNCTION public.manage_competition_teams(
    p_competition_id UUID,
    p_team_ids UUID[]
)
RETURNS SETOF public.competition_teams
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can manage competition teams';
    END IF;

    -- Delete existing teams not in the new list
    DELETE FROM public.competition_teams
    WHERE competition_id = p_competition_id
    AND team_id <> ALL(p_team_ids);

    -- Insert new teams
    INSERT INTO public.competition_teams (competition_id, team_id, status)
    SELECT p_competition_id, team_id, 'active'
    FROM unnest(p_team_ids) AS team_id
    ON CONFLICT (competition_id, team_id) DO NOTHING;

    RETURN QUERY
    SELECT * FROM public.competition_teams
    WHERE competition_id = p_competition_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.manage_competition_teams(UUID, UUID[]) TO authenticated; 