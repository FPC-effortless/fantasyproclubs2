-- Create function to get available players
CREATE OR REPLACE FUNCTION get_available_players(team_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  username TEXT,
  user_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.display_name,
    up.username,
    up.user_type
  FROM user_profiles up
  WHERE up.user_type = 'player'
  AND NOT EXISTS (
    SELECT 1 
    FROM players p 
    WHERE p.user_id = up.id
  );
END;
$$ LANGUAGE plpgsql; 