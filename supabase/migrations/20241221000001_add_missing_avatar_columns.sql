-- =============================================================================
-- ADD MISSING AVATAR AND LOGO COLUMNS - EA FC Pro Clubs App
-- Date: 2024-12-21
-- Purpose: Ensure all tables have necessary avatar_url and logo_url columns
-- =============================================================================

-- Add avatar_url to players table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name = 'avatar_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.players ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to players table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in players table';
    END IF;
END $$;

-- Ensure competitions table has logo_url column (should already exist from schema)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competitions' 
        AND column_name = 'logo_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.competitions ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url column to competitions table';
    ELSE
        RAISE NOTICE 'logo_url column already exists in competitions table';
    END IF;
END $$;

-- Ensure teams table has logo_url column (should already exist from migration)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name = 'logo_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url column to teams table';
    ELSE
        RAISE NOTICE 'logo_url column already exists in teams table';
    END IF;
END $$;

-- Ensure user_profiles table has avatar_url column (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'avatar_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to user_profiles table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in user_profiles table';
    END IF;
END $$;

-- Create storage buckets for images if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('competition-logos', 'competition-logos', true),
    ('player-avatars', 'player-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
CREATE POLICY "Public Access Avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Upload Avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Owner Update Avatars" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid() = owner
    );

CREATE POLICY "Owner Delete Avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid() = owner
    );

-- Set up storage policies for competition-logos bucket
CREATE POLICY "Public Access Competition Logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'competition-logos');

CREATE POLICY "Admin Upload Competition Logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'competition-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin Update Competition Logos" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'competition-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin Delete Competition Logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'competition-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

-- Set up storage policies for player-avatars bucket
CREATE POLICY "Public Access Player Avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'player-avatars');

CREATE POLICY "Authenticated Upload Player Avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'player-avatars'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Owner Update Player Avatars" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'player-avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid() = owner
    );

CREATE POLICY "Owner Delete Player Avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'player-avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid() = owner
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_avatar_url ON public.players(avatar_url);
CREATE INDEX IF NOT EXISTS idx_teams_logo_url ON public.teams(logo_url);
CREATE INDEX IF NOT EXISTS idx_competitions_logo_url ON public.competitions(logo_url);
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url ON public.user_profiles(avatar_url);

-- Verify the schema changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('players', 'teams', 'competitions', 'user_profiles')
AND column_name IN ('avatar_url', 'logo_url')
ORDER BY table_name, column_name; 