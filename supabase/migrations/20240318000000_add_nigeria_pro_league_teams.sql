-- Declare variable for competition ID
DO $$ 
DECLARE 
    competition_id UUID;
BEGIN
    -- Create the Nigeria Pro Club League competition
    INSERT INTO competitions (id, name, description, status, start_date)
    VALUES (
        gen_random_uuid(),
        'Nigeria Pro Club League',
        'The premier competition for Fantasy Pro Clubs teams in Nigeria',
        'active',
        NOW()
    )
    RETURNING id INTO competition_id;

    -- Create the teams with their abbreviations
    WITH new_teams AS (
        INSERT INTO teams (name, short_name, description, manager_id)
        VALUES 
            ('Nameless Chaos', 'NCH', 'A formidable force in the Nigeria Pro Club League', NULL),
            ('Menace FC', 'MFC', 'Striking fear into opponents hearts', NULL),
            ('As Tornado', 'TOR', 'Sweeping through the competition like a storm', NULL),
            ('Get Clapped', 'GCF', 'Making noise in the league', NULL),
            ('Martial XI', 'MXI', 'Masters of the martial art of football', NULL),
            ('Talker FC', 'TFC', 'Letting their game do the talking', NULL),
            ('Adventure Time', 'ADV', 'Every match is a new adventure', NULL),
            ('Effortless VFC', 'EFC', 'Making it look easy', NULL),
            ('Phoenix VFC', 'PHX', 'Rising from the ashes', NULL),
            ('Galaxy 11', 'GLX', 'A constellation of stars', NULL),
            ('Faceless Men XI', 'FMX', 'The team of many talents', NULL),
            ('Curryz FC', 'CFC', 'Spicing up the league', NULL)
        RETURNING id, name
    )
    -- Add all teams to the competition
    INSERT INTO competition_teams (competition_id, team_id, status)
    SELECT 
        competition_id,
        id,
        'active'
    FROM new_teams;

    -- Add gaming settings for each team
    UPDATE teams
    SET gaming = '{
        "preferred_platform": "both",
        "platform_requirements": {
            "xbox_required": false,
            "psn_required": false,
            "min_experience": "beginner"
        },
        "platform_stats": {
            "xbox_players": 0,
            "psn_players": 0,
            "cross_platform_players": 0
        }
    }'::jsonb
    WHERE name IN (
        'Nameless Chaos',
        'Menace FC',
        'As Tornado',
        'Get Clapped',
        'Martial XI',
        'Talker FC',
        'Adventure Time',
        'Effortless VFC',
        'Phoenix VFC',
        'Galaxy 11',
        'Faceless Men XI',
        'Curryz FC'
    );
END $$; 