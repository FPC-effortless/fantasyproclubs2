-- Add status column to player_match_stats table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'player_match_stats' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE player_match_stats 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Update any existing rows to have the default status
UPDATE player_match_stats SET status = 'pending' WHERE status IS NULL; 