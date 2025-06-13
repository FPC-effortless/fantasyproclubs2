-- Add gaming platform fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS xbox_gamertag TEXT,
ADD COLUMN IF NOT EXISTS psn_id TEXT,
ADD COLUMN IF NOT EXISTS preferred_platform TEXT CHECK (preferred_platform IN ('xbox', 'playstation', 'both'));

-- Create indexes for gaming fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_xbox_gamertag ON public.user_profiles(xbox_gamertag);
CREATE INDEX IF NOT EXISTS idx_user_profiles_psn_id ON public.user_profiles(psn_id);

-- Add unique constraints to prevent duplicate gamertags
ALTER TABLE public.user_profiles 
ADD CONSTRAINT unique_xbox_gamertag UNIQUE (xbox_gamertag),
ADD CONSTRAINT unique_psn_id UNIQUE (psn_id);

-- Update the handle_new_user function to include gaming fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        user_id,
        email, 
        username, 
        display_name,
        user_type,
        xbox_gamertag,
        psn_id,
        preferred_platform
    )
    VALUES (
        new.id, 
        new.id,
        new.email, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
        COALESCE(new.raw_user_meta_data->>'user_type', 'fan'),
        new.raw_user_meta_data->>'xbox_gamertag',
        new.raw_user_meta_data->>'psn_id',
        new.raw_user_meta_data->>'preferred_platform'
    );
    RETURN new;
END;
$$ language 'plpgsql' security definer;

-- Add comment explaining the fields
COMMENT ON COLUMN public.user_profiles.xbox_gamertag IS 'Xbox Live gamertag for the user';
COMMENT ON COLUMN public.user_profiles.psn_id IS 'PlayStation Network ID for the user';
COMMENT ON COLUMN public.user_profiles.preferred_platform IS 'User''s preferred gaming platform'; 