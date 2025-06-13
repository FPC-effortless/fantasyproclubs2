-- Add is_featured column to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add team stats columns if they don't exist
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS home_team_stats JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS away_team_stats JSONB DEFAULT '{}'::JSONB;

-- Update existing teams with short names
UPDATE public.teams
SET short_name = CASE 
    WHEN name LIKE 'Test Team %' THEN 'TT' || SUBSTRING(name FROM 'Test Team ([0-9]+)')
    ELSE LEFT(name, 3)
END
WHERE short_name = 'TBD';

-- Insert some test matches
INSERT INTO public.matches (
    home_team_id,
    away_team_id,
    match_date,
    status,
    is_featured,
    home_team_stats,
    away_team_stats
)
SELECT 
    t1.id as home_team_id,
    t2.id as away_team_id,
    NOW() + (i || ' days')::INTERVAL as match_date,
    'scheduled' as status,
    CASE WHEN i = 1 THEN true ELSE false END as is_featured,
    jsonb_build_object(
        'possession', 0,
        'shots', 0,
        'shots_on_target', 0,
        'goals', 0
    ) as home_team_stats,
    jsonb_build_object(
        'possession', 0,
        'shots', 0,
        'shots_on_target', 0,
        'goals', 0
    ) as away_team_stats
FROM 
    (SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn FROM public.teams) t1
    CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY name DESC) as rn FROM public.teams) t2,
    generate_series(1, 3) i
WHERE 
    t1.rn <= 4 
    AND t2.rn <= 4 
    AND t1.id != t2.id; 