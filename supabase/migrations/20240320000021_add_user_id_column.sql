-- First add the user_id column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES auth.users(id);

-- Copy data from psn_id to user_id
UPDATE user_profiles 
SET user_id = psn_id 
WHERE psn_id IS NOT NULL;

-- Add unique constraint on user_id
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);

-- Add not null constraint after data migration
ALTER TABLE user_profiles 
ALTER COLUMN user_id SET NOT NULL; 