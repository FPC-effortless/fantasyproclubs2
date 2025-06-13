-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "extensions";

-- Add logo_url column to teams table if it doesn't exist
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Admin Upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'team-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin Update" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'team-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin Delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'team-logos'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    ); 