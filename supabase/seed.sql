-- Insert sample countries
INSERT INTO public.countries (id, name, flag_url) VALUES
    ('1f0db9ec-47c8-4fb1-9582-86339917af8f', 'England', 'https://flagcdn.com/gb-eng.svg'),
    ('2a5c4e1b-83d1-4a3b-9d7f-12e86c749dc3', 'Spain', 'https://flagcdn.com/es.svg'),
    ('3b7d5f2a-94e2-4c5d-8e60-15f97d8b3e4f', 'Germany', 'https://flagcdn.com/de.svg'),
    ('4c8e6d3b-a5f3-4d6e-9f71-26a08e9c4f5g', 'France', 'https://flagcdn.com/fr.svg'),
    ('e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0e', 'England', '/flags/england.png'),
    ('f8c2e426-63a7-4c66-b7a4-c15e5c3c4b0f', 'Spain', '/flags/spain.png'),
    ('e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0f', 'Nigeria', '/flags/nigeria.png')
ON CONFLICT (id) DO NOTHING;

-- Insert sample competitions
INSERT INTO public.competitions (id, name, description, type, status, start_date, end_date, max_teams, logo_url, country_id) VALUES
    ('5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h', 'Premier League', 'English Premier League', 'league', 'active', NOW(), NOW() + INTERVAL '3 months', 20, 'https://example.com/premier-league.png', 'e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0e'),
    ('6e0g8f5d-c7h5-5i6j-0k83-48c20f1d6g7i', 'La Liga', 'Spanish La Liga', 'league', 'active', NOW(), NOW() + INTERVAL '3 months', 20, 'https://example.com/la-liga.png', 'f8c2e426-63a7-4c66-b7a4-c15e5c3c4b0f'),
    ('7f1h9g6e-d8i6-6j7k-1l94-59d31g2e7h8j', 'Champions Cup', 'European Champions Cup', 'cup', 'upcoming', NOW() + INTERVAL '1 month', NOW() + INTERVAL '4 months', 32, 'https://example.com/champions-cup.png', 'f8c2e426-63a7-4c66-b7a4-c15e5c3c4b0f'),
    ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Premier Pro League', 'The most prestigious pro clubs league', 'league', 'active', NOW(), NOW() + INTERVAL '3 months', 20, '/competitions/premier-league.png', 'e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0e'),
    ('b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e', 'Champions Cup', 'Elite knockout tournament for the best teams', 'cup', 'upcoming', NOW() + INTERVAL '1 month', NOW() + INTERVAL '4 months', 32, '/competitions/champions-cup.png', 'f8c2e426-63a7-4c66-b7a4-c15e5c3c4b0f'),
    ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', 'Nigeria Pro Club League', 'league', 'active', NOW(), NOW() + INTERVAL '3 months', 12, 'e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0f')
ON CONFLICT (id) DO NOTHING;

-- Insert sample teams
INSERT INTO public.teams (id, name, logo_url, description) VALUES
    ('8g2i0h7f-e9j7-7k8l-2m05-60e42h3f8i9k', 'Red Dragons FC', 'https://example.com/red-dragons.png', 'A fierce team from Manchester'),
    ('9h3j1i8g-f0k8-8l9m-3n16-71f53i4g9j0l', 'Blue Lions United', 'https://example.com/blue-lions.png', 'London''s finest football club'),
    ('0i4k2j9h-g1l9-9m0n-4o27-82g64j5h0k1m', 'Golden Eagles SC', 'https://example.com/golden-eagles.png', 'Rising stars from Liverpool')
ON CONFLICT (id) DO NOTHING;

-- Insert sample competition_teams relationships with standings data
INSERT INTO public.competition_teams (
    competition_id,
    team_id,
    status,
    points,
    matches_played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    position
) VALUES
    -- Premier League Teams
    (
        '5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h',
        '8g2i0h7f-e9j7-7k8l-2m05-60e42h3f8i9k',
        'active',
        25,
        10,
        8,
        1,
        1,
        24,
        8,
        16,
        1
    ),
    (
        '5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h',
        '9h3j1i8g-f0k8-8l9m-3n16-71f53i4g9j0l',
        'active',
        21,
        10,
        6,
        3,
        1,
        18,
        10,
        8,
        2
    ),
    (
        '5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h',
        '0i4k2j9h-g1l9-9m0n-4o27-82g64j5h0k1m',
        'active',
        18,
        10,
        5,
        3,
        2,
        16,
        12,
        4,
        3
    ),
    -- Champions Cup Teams
    (
        '7f1h9g6e-d8i6-6j7k-1l94-59d31g2e7h8j',
        '8g2i0h7f-e9j7-7k8l-2m05-60e42h3f8i9k',
        'active',
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null
    ),
    (
        '7f1h9g6e-d8i6-6j7k-1l94-59d31g2e7h8j',
        '9h3j1i8g-f0k8-8l9m-3n16-71f53i4g9j0l',
        'active',
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null
    )
ON CONFLICT (competition_id, team_id) DO NOTHING;

-- Insert sample news articles
INSERT INTO public.news (title, content, category, slug, image_url) VALUES
    ('Season Kickoff Announced', 'The new season is set to begin next month...', 'Announcements', 'season-kickoff-announced', 'https://example.com/kickoff.jpg'),
    ('Transfer Window Updates', 'Latest updates from the transfer market...', 'Transfers', 'transfer-window-updates', 'https://example.com/transfers.jpg'),
    ('New Tournament Rules', 'Important changes to tournament regulations...', 'Rules', 'new-tournament-rules', 'https://example.com/rules.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample matches
INSERT INTO public.matches (
    id,
    competition_id,
    home_team_id,
    away_team_id,
    match_date,
    status,
    venue,
    home_team_stats,
    away_team_stats
) VALUES
    (
        'a5b6c7d8-e9f0-4g5h-6i7j-8k9l0m1n2o3',
        '5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h',
        '8g2i0h7f-e9j7-7k8l-2m05-60e42h3f8i9k',
        '9h3j1i8g-f0k8-8l9m-3n16-71f53i4g9j0l',
        NOW() + INTERVAL '7 days',
        'scheduled',
        'Manchester Stadium',
        '{"goals": 0, "possession": 0, "shots": 0, "shots_on_target": 0}',
        '{"goals": 0, "possession": 0, "shots": 0, "shots_on_target": 0}'
    ),
    (
        'b6c7d8e9-f0g1-5h6i-7j8k-9l0m1n2o3p4',
        '5d9f7e4c-b6g4-4h5i-9j72-37b19e0c5f6h',
        '0i4k2j9h-g1l9-9m0n-4o27-82g64j5h0k1m',
        '8g2i0h7f-e9j7-7k8l-2m05-60e42h3f8i9k',
        NOW() + INTERVAL '14 days',
        'scheduled',
        'Liverpool Arena',
        '{"goals": 0, "possession": 0, "shots": 0, "shots_on_target": 0}',
        '{"goals": 0, "possession": 0, "shots": 0, "shots_on_target": 0}'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample featured matches
INSERT INTO public.featured_matches (id, match_id, title, description, active) VALUES
    (
        'c7d8e9f0-g1h2-6i7j-8k9l-0m1n2o3p4q5',
        'a5b6c7d8-e9f0-4g5h-6i7j-8k9l0m1n2o3',
        'Premier League Showdown',
        'Red Dragons FC takes on Blue Lions United in this season''s most anticipated match!',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- Create sample stat point rules (if needed for your app)
INSERT INTO public.stat_point_rules (
    id,
    stat_name,
    points,
    position,
    description
) VALUES
    ('d8e9f0g1-h2i3-7j8k-9l0m-1n2o3p4q5r6', 'goal', 4, 'FWD', 'Points for scoring a goal as a forward'),
    ('e9f0g1h2-i3j4-8k9l-0m1n-2o3p4q5r6s7', 'assist', 3, 'MID', 'Points for making an assist as a midfielder'),
    ('f0g1h2i3-j4k5-9l0m-1n2o-3p4q5r6s7t8', 'clean_sheet', 4, 'GK', 'Points for keeping a clean sheet as a goalkeeper')
ON CONFLICT (id) DO NOTHING;

-- Add teams to the competition
DO $$ 
DECLARE
  team_id UUID;
  competition_id UUID := 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e';
BEGIN
  FOR team_id IN 
    SELECT id FROM public.teams LIMIT 12
  LOOP
    PERFORM public.add_team_to_competition(team_id, competition_id);
  END LOOP;
END $$; 