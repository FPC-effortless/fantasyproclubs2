-- Drop and recreate policies that were using role instead of user_type
DROP POLICY IF EXISTS "Competitions can be managed by admins" ON public.competitions;
CREATE POLICY "Competitions can be managed by admins"
    ON public.competitions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Matches can be managed by admins" ON public.matches;
CREATE POLICY "Matches can be managed by admins"
    ON public.matches FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Enable full access for admins" ON public.competition_teams;
CREATE POLICY "Enable full access for admins"
    ON public.competition_teams FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Allow admins full access to system settings" ON public.system_settings;
CREATE POLICY "Allow admins full access to system settings"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Update the manage_competition_teams function to use user_type
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