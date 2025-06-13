-- Add a check constraint to competition_teams table to ensure teams have a manager
ALTER TABLE competition_teams ADD CONSTRAINT team_must_have_manager 
CHECK (
    EXISTS (
        SELECT 1 FROM teams 
        WHERE teams.id = competition_teams.team_id 
        AND teams.manager_id IS NOT NULL
    )
);

-- Add a trigger to prevent teams without managers from joining competitions
CREATE OR REPLACE FUNCTION check_team_has_manager()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM teams 
        WHERE teams.id = NEW.team_id 
        AND teams.manager_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Teams must have a manager assigned before joining competitions';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_team_manager_before_competition
    BEFORE INSERT OR UPDATE ON competition_teams
    FOR EACH ROW
    EXECUTE FUNCTION check_team_has_manager();

-- Update existing competition_teams entries to comply with new constraints
-- This will remove teams without managers from competitions
DELETE FROM competition_teams ct
WHERE NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = ct.team_id 
    AND t.manager_id IS NOT NULL
); 