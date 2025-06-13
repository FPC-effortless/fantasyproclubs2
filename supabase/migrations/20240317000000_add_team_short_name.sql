-- Add short_name column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_name TEXT;

-- Update existing teams to have a default short name based on their name
UPDATE teams
SET short_name = UPPER(
    CASE 
        WHEN position(' ' in name) > 0 
        THEN string_agg(left(word, 1), '' ORDER BY idx)
        ELSE left(name, 3)
    END
)
FROM (
    SELECT id, name, 
           generate_subscripts(regexp_split_to_array(name, ' '), 1) as idx,
           unnest(regexp_split_to_array(name, ' ')) as word
    FROM teams
) as words
WHERE teams.id = words.id
GROUP BY teams.id, teams.name;

-- Make short_name required for new teams
ALTER TABLE teams ALTER COLUMN short_name SET NOT NULL; 