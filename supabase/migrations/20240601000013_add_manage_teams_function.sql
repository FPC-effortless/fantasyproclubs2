-- Create or replace the function to manage competition teams
CREATE OR REPLACE FUNCTION public.manage_competition_teams(
    p_competition_id UUID,
    p_team_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete existing teams that are not in the new list
    DELETE FROM public.competition_teams
    WHERE competition_id = p_competition_id
    AND team_id != ALL(p_team_ids);

    -- Insert new teams that don't exist yet
    INSERT INTO public.competition_teams (competition_id, team_id, status)
    SELECT p_competition_id, team_id, 'active'
    FROM unnest(p_team_ids) AS team_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.competition_teams
        WHERE competition_id = p_competition_id
        AND team_id = team_id
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.manage_competition_teams TO authenticated;

-- Create policy to allow authenticated users to manage competition teams
CREATE POLICY "Allow authenticated users to manage competition teams"
    ON public.competition_teams
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    ); 