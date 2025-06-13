-- Add missing columns to teams table

-- Add short_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'short_name'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN short_name TEXT;
        
        -- Set default short names for existing teams
        UPDATE public.teams 
        SET short_name = UPPER(LEFT(REGEXP_REPLACE(name, '[^a-zA-Z0-9 ]', '', 'g'), 3))
        WHERE short_name IS NULL;
        
        -- Make it NOT NULL after setting defaults
        ALTER TABLE public.teams ALTER COLUMN short_name SET NOT NULL;
        
        -- Add unique constraint
        ALTER TABLE public.teams ADD CONSTRAINT teams_short_name_unique UNIQUE(short_name);
    END IF;
END $$;

-- Add logo_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add gaming column for gaming platform info
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'gaming'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN gaming JSONB DEFAULT '{}'::JSONB;
    END IF;
END $$;

-- Add team statistics columns
DO $$ 
BEGIN
    -- Add founded_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'founded_date'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN founded_date DATE;
    END IF;
    
    -- Add home_venue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'home_venue'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN home_venue TEXT;
    END IF;
    
    -- Add website
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN website TEXT;
    END IF;
    
    -- Add social media
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'social_media'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN social_media JSONB DEFAULT '{}'::JSONB;
    END IF;
    
    -- Add team status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disbanded', 'suspended'));
    END IF;
    
    -- Add country_id for team nationality
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'country_id'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;
    END IF;
    
    -- Add league tier
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'league_tier'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN league_tier INTEGER DEFAULT 1;
    END IF;
END $$;

-- Remove the old tag column if it exists and we have short_name
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'tag'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'short_name'
    ) THEN
        -- Copy tag to short_name if short_name is empty
        UPDATE public.teams 
        SET short_name = tag 
        WHERE short_name IS NULL AND tag IS NOT NULL;
        
        -- Drop the tag column
        ALTER TABLE public.teams DROP COLUMN tag;
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_teams_short_name ON public.teams(short_name);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_country_id ON public.teams(country_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON public.teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_league_tier ON public.teams(league_tier); 