-- Make player number nullable since jersey numbers are optional
ALTER TABLE players ALTER COLUMN number DROP NOT NULL;

-- Add a comment to clarify the purpose
COMMENT ON COLUMN players.number IS 'Jersey number (1-99), optional'; 