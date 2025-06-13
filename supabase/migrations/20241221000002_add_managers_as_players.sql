-- =============================================================================
-- ADD MANAGERS AS PLAYERS - EA FC Pro Clubs App
-- Date: 2024-12-21
-- Purpose: Ensure team managers are also players in their teams for fantasy
-- =============================================================================

-- Function to add managers as players in their teams
CREATE OR REPLACE FUNCTION add_managers_as_players()
RETURNS void AS $$
DECLARE
    team_record RECORD;
    existing_player_count INTEGER;
    next_player_number INTEGER;
BEGIN
    -- Loop through all teams that have managers
    FOR team_record IN 
        SELECT t.id as team_id, t.manager_id, t.name as team_name
        FROM teams t
        WHERE t.manager_id IS NOT NULL
    LOOP
        -- Check if manager is already a player in their team
        IF NOT EXISTS (
            SELECT 1 FROM players p
            WHERE p.user_id = team_record.manager_id
            AND p.team_id = team_record.team_id
        ) THEN
            -- Get current player count for the team
            SELECT COUNT(*) INTO existing_player_count
            FROM players p
            WHERE p.team_id = team_record.team_id;
            
            -- Find the next available player number (1-99)
            SELECT COALESCE(MIN(available_number), 1) INTO next_player_number
            FROM (
                SELECT generate_series(1, 99) as available_number
                EXCEPT
                SELECT number FROM players WHERE team_id = team_record.team_id
            ) available_numbers;
            
            -- Insert manager as a player
            INSERT INTO players (
                user_id,
                team_id,
                position,
                number,
                status,
                avatar_url
            ) VALUES (
                team_record.manager_id,
                team_record.team_id,
                'MID', -- Default position for manager-players
                next_player_number,
                'active',
                NULL
            );
            
            RAISE NOTICE 'Added manager % as player #% in team %', 
                team_record.manager_id, next_player_number, team_record.team_name;
        ELSE
            RAISE NOTICE 'Manager % is already a player in team %', 
                team_record.manager_id, team_record.team_name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically add new managers as players
CREATE OR REPLACE FUNCTION auto_add_manager_as_player()
RETURNS TRIGGER AS $$
DECLARE
    next_player_number INTEGER;
BEGIN
    -- Only process if manager_id is being set (not null)
    IF NEW.manager_id IS NOT NULL THEN
        -- Check if this manager is already a player in this team
        IF NOT EXISTS (
            SELECT 1 FROM players p
            WHERE p.user_id = NEW.manager_id
            AND p.team_id = NEW.id
        ) THEN
            -- Find the next available player number
            SELECT COALESCE(MIN(available_number), 1) INTO next_player_number
            FROM (
                SELECT generate_series(1, 99) as available_number
                EXCEPT
                SELECT number FROM players WHERE team_id = NEW.id
            ) available_numbers;
            
            -- Insert manager as a player
            INSERT INTO players (
                user_id,
                team_id,
                position,
                number,
                status,
                avatar_url
            ) VALUES (
                NEW.manager_id,
                NEW.id,
                'MID', -- Default position for manager-players
                next_player_number,
                'active',
                NULL
            );
            
            RAISE NOTICE 'Auto-added manager % as player #% in team %', 
                NEW.manager_id, next_player_number, NEW.name;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add managers as players
DROP TRIGGER IF EXISTS auto_add_manager_as_player_trigger ON teams;
CREATE TRIGGER auto_add_manager_as_player_trigger
    AFTER INSERT OR UPDATE OF manager_id ON teams
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_manager_as_player();

-- Add existing managers as players
SELECT add_managers_as_players();

-- Add is_manager flag to players table to identify manager-players
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name = 'is_manager' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.players ADD COLUMN is_manager BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_manager column to players table';
    ELSE
        RAISE NOTICE 'is_manager column already exists in players table';
    END IF;
END $$;

-- Update existing manager-players to set is_manager flag
UPDATE players SET is_manager = TRUE
WHERE EXISTS (
    SELECT 1 FROM teams t
    WHERE t.manager_id = players.user_id
    AND t.id = players.team_id
);

-- Add fantasy_price and fantasy_points columns to players if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name = 'fantasy_price' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.players ADD COLUMN fantasy_price DECIMAL(10,2) DEFAULT 5.0;
        RAISE NOTICE 'Added fantasy_price column to players table';
    ELSE
        RAISE NOTICE 'fantasy_price column already exists in players table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name = 'fantasy_points' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.players ADD COLUMN fantasy_points DECIMAL(10,2) DEFAULT 0.0;
        RAISE NOTICE 'Added fantasy_points column to players table';
    ELSE
        RAISE NOTICE 'fantasy_points column already exists in players table';
    END IF;
END $$;

-- Set higher fantasy prices for manager-players since they're usually key players
UPDATE players 
SET fantasy_price = 8.0
WHERE is_manager = TRUE AND fantasy_price = 5.0;

-- Create view for fantasy-eligible players (including managers)
CREATE OR REPLACE VIEW fantasy_eligible_players AS
SELECT 
    p.id,
    p.user_id,
    p.team_id,
    p.position,
    p.number,
    p.status,
    p.is_manager,
    p.fantasy_price,
    p.fantasy_points,
    p.avatar_url,
    up.display_name,
    up.username,
    up.avatar_url as user_avatar_url,
    t.name as team_name,
    t.short_name as team_short_name,
    t.logo_url as team_logo_url,
    -- Calculate fantasy role based on position
    CASE 
        WHEN p.position IN ('GK', 'Goalkeeper') THEN 'GK'
        WHEN p.position IN ('DEF', 'Defender', 'CB', 'LB', 'RB', 'LWB', 'RWB') THEN 'DEF'
        WHEN p.position IN ('MID', 'Midfielder', 'CM', 'CDM', 'CAM', 'LM', 'RM') THEN 'MID'
        WHEN p.position IN ('FWD', 'Forward', 'ST', 'CF', 'LW', 'RW') THEN 'FWD'
        ELSE 'MID'
    END as fantasy_role
FROM players p
JOIN user_profiles up ON p.user_id = up.id
JOIN teams t ON p.team_id = t.id
WHERE p.status = 'active';

-- Grant permissions on the view
GRANT SELECT ON fantasy_eligible_players TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_is_manager ON players(is_manager);
CREATE INDEX IF NOT EXISTS idx_players_fantasy_price ON players(fantasy_price);
CREATE INDEX IF NOT EXISTS idx_players_fantasy_points ON players(fantasy_points);
CREATE INDEX IF NOT EXISTS idx_players_user_team ON players(user_id, team_id);

-- Create function to get manager-player info
CREATE OR REPLACE FUNCTION get_manager_player_info(team_uuid UUID)
RETURNS TABLE (
    player_id UUID,
    user_id UUID,
    display_name TEXT,
    username TEXT,
    position TEXT,
    number INTEGER,
    fantasy_price DECIMAL(10,2),
    fantasy_points DECIMAL(10,2),
    is_manager BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as player_id,
        p.user_id,
        up.display_name,
        up.username,
        p.position,
        p.number,
        p.fantasy_price,
        p.fantasy_points,
        p.is_manager
    FROM players p
    JOIN user_profiles up ON p.user_id = up.id
    JOIN teams t ON p.team_id = t.id
    WHERE t.id = team_uuid
    AND p.is_manager = TRUE
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_manager_player_info(UUID) TO authenticated;

-- Verify the changes
DO $$
DECLARE
    manager_player_count INTEGER;
    total_teams_with_managers INTEGER;
BEGIN
    -- Count teams with managers
    SELECT COUNT(*) INTO total_teams_with_managers
    FROM teams
    WHERE manager_id IS NOT NULL;
    
    -- Count manager-players
    SELECT COUNT(*) INTO manager_player_count
    FROM players
    WHERE is_manager = TRUE;
    
    RAISE NOTICE 'Teams with managers: %', total_teams_with_managers;
    RAISE NOTICE 'Manager-players created: %', manager_player_count;
    
    IF manager_player_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Managers are now available as players for fantasy selection!';
    ELSE
        RAISE NOTICE 'INFO: No manager-players were created. This might be normal if there are no teams with managers yet.';
    END IF;
END $$; 