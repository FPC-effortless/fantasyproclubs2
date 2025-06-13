-- Step 1: Remove any existing triggers/functions
DROP TRIGGER IF EXISTS enforce_team_manager_before_competition ON competition_teams;
DROP FUNCTION IF EXISTS check_team_has_manager();

-- Step 2: Add short_name column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_name TEXT;

-- Step 3: Update existing teams to have a default short name based on their name
UPDATE teams
SET short_name = UPPER(
    CASE 
        WHEN position(' ' in name) > 0 
        THEN LEFT(REGEXP_REPLACE(name, '[^a-zA-Z0-9 ]', '', 'g'), 3)
        ELSE LEFT(name, 3)
    END
)
WHERE short_name IS NULL;

-- Step 4: Now make short_name NOT NULL
ALTER TABLE teams ALTER COLUMN short_name SET NOT NULL;

-- Step 5: Create trigger function to check manager
CREATE OR REPLACE FUNCTION check_team_has_manager()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the team has a manager when being added to a competition
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

-- Step 6: Create trigger to enforce manager requirement
CREATE TRIGGER enforce_team_manager_before_competition
    BEFORE INSERT OR UPDATE ON competition_teams
    FOR EACH ROW
    EXECUTE FUNCTION check_team_has_manager();

-- Step 7: Create trigger function to handle team manager removal
CREATE OR REPLACE FUNCTION handle_team_manager_removal()
RETURNS TRIGGER AS $$
BEGIN
    -- If manager is being removed, remove team from all competitions
    IF OLD.manager_id IS NOT NULL AND (NEW.manager_id IS NULL OR NEW.manager_id != OLD.manager_id) THEN
        DELETE FROM competition_teams WHERE team_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for team manager changes
CREATE TRIGGER enforce_team_manager_removal
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION handle_team_manager_removal();

-- Step 9: Clean up existing entries
DELETE FROM competition_teams ct
WHERE NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = ct.team_id 
    AND t.manager_id IS NOT NULL
);

-- Step 10: Delete existing teams (if any) to start fresh
DELETE FROM teams;

-- Step 11: Create teams
INSERT INTO teams (name, short_name) VALUES 
    ('Nameless Chaos', 'NCH'),
    ('Menace FC', 'MFC'),
    ('As Tornado', 'TOR'),
    ('Get Clapped', 'GCF'),
    ('Martial XI', 'MXI'),
    ('Talker FC', 'TFC'),
    ('Adventure Time', 'ADV'),
    ('Effortless VFC', 'EFC'),
    ('Phoenix VFC', 'PHX'),
    ('Galaxy 11', 'GLX'),
    ('Faceless Men XI', 'FMX'),
    ('Curryz FC', 'CFC');

-- Step 12: Create competition
INSERT INTO competitions (name, type, status, start_date, end_date)
VALUES (
    'Nigeria Pro Club League',
    'league',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '3 months'
); 