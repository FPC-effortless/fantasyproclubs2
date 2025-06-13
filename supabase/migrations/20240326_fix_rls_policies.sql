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
DROP POLICY IF EXISTS "Users can create their own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can delete their own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can manage all profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."competitions";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."competitions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."stat_point_rules";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."stat_point_rules";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."fantasy_seasons";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."fantasy_seasons";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."competition_teams";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."competition_teams";
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

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_profiles();
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.get_competitions();
DROP FUNCTION IF EXISTS public.get_stat_point_rules();
DROP FUNCTION IF EXISTS public.get_fantasy_seasons();
DROP FUNCTION IF EXISTS public.version();

-- Create secure functions for data access
CREATE OR REPLACE FUNCTION public.get_user_profiles()
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.user_profiles;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT * FROM public.user_profiles WHERE id = user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id uuid,
  updates jsonb
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.user_profiles;
BEGIN
  IF auth.uid() = user_id THEN
    UPDATE public.user_profiles
    SET 
      display_name = COALESCE((updates->>'display_name')::text, display_name),
      username = COALESCE((updates->>'username')::text, username),
      avatar_url = COALESCE((updates->>'avatar_url')::text, avatar_url),
      bio = COALESCE((updates->>'bio')::text, bio),
      gaming = COALESCE((updates->>'gaming')::jsonb, gaming),
      stats = COALESCE((updates->>'stats')::jsonb, stats),
      notifications = COALESCE((updates->>'notifications')::jsonb, notifications),
      display = COALESCE((updates->>'display')::jsonb, display)
    WHERE id = user_id
    RETURNING * INTO result;
    
    RETURN result;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_competitions()
RETURNS SETOF public.competitions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.competitions;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_stat_point_rules()
RETURNS SETOF public.stat_point_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.stat_point_rules;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_fantasy_seasons()
RETURNS SETOF public.fantasy_seasons
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.fantasy_seasons;
END;
$$;

-- Version function for health check
CREATE OR REPLACE FUNCTION public.version()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN current_setting('server_version');
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_competitions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stat_point_rules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fantasy_seasons() TO authenticated;
GRANT EXECUTE ON FUNCTION public.version() TO authenticated;

-- Grant execute permissions to anon users for public functions
GRANT EXECUTE ON FUNCTION public.version() TO anon;

-- Grant table access permissions
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.competitions TO authenticated;
GRANT SELECT ON public.stat_point_rules TO authenticated;
GRANT SELECT ON public.fantasy_seasons TO authenticated;
GRANT UPDATE ON public.user_profiles TO authenticated;

-- Ensure RLS is disabled
ALTER TABLE IF EXISTS "public"."user_profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."stat_point_rules" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."fantasy_seasons" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competition_teams" DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS on all tables
ALTER TABLE IF EXISTS "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."stat_point_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."fantasy_seasons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competition_teams" ENABLE ROW LEVEL SECURITY;

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
        AND user_profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
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
        AND role = 'admin'
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