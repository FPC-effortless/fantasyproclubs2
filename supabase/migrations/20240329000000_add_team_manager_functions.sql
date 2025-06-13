-- Create a function to assign a manager to a team
CREATE OR REPLACE FUNCTION public.assign_team_manager(
    p_team_id UUID,
    p_manager_id UUID
)
RETURNS public.teams
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_team public.teams;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can assign team managers';
    END IF;

    -- Check if the manager exists and is of type 'manager'
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_manager_id
        AND user_type = 'manager'
    ) THEN
        RAISE EXCEPTION 'User must be a manager to be assigned to a team';
    END IF;

    -- Check if the manager is already assigned to another team
    IF EXISTS (
        SELECT 1 FROM public.teams
        WHERE manager_id = p_manager_id
    ) THEN
        RAISE EXCEPTION 'Manager is already assigned to another team';
    END IF;

    -- Update the team with the new manager
    UPDATE public.teams
    SET 
        manager_id = p_manager_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_team_id
    RETURNING * INTO v_team;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found';
    END IF;

    RETURN v_team;
END;
$$;

-- Create a function to remove a manager from a team
CREATE OR REPLACE FUNCTION public.remove_team_manager(
    p_team_id UUID
)
RETURNS public.teams
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_team public.teams;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can remove team managers';
    END IF;

    -- Check if the team is in any active competitions
    IF EXISTS (
        SELECT 1 FROM public.competition_teams
        WHERE team_id = p_team_id
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Cannot remove manager from team in active competitions';
    END IF;

    -- Update the team to remove the manager
    UPDATE public.teams
    SET 
        manager_id = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_team_id
    RETURNING * INTO v_team;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found';
    END IF;

    RETURN v_team;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_team_manager(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_team_manager(UUID) TO authenticated; 