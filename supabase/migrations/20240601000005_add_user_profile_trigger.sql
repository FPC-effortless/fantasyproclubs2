-- Create a trigger to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_type,
    display_name,
    username,
    avatar_url,
    gaming,
    stats,
    notifications,
    display
  )
  VALUES (
    new.id,
    'fan',  -- Default user type
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    '{
      "xbox_gamertag": null,
      "psn_id": null,
      "preferred_platform": "both",
      "experience_level": "beginner",
      "platform_verified": false
    }'::jsonb,
    '{
      "matches_played": 0,
      "win_rate": 0,
      "goals_per_game": 0
    }'::jsonb,
    '{
      "email": true,
      "push": true
    }'::jsonb,
    '{
      "theme": "system",
      "language": "en"
    }'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile(); 