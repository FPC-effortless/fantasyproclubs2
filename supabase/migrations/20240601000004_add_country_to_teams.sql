-- Add country column to teams table
ALTER TABLE teams ADD COLUMN country TEXT;

-- Update existing teams to have a default country
UPDATE teams SET country = 'Unknown' WHERE country IS NULL;
 
-- Make country column required for future inserts
ALTER TABLE teams ALTER COLUMN country SET NOT NULL; 