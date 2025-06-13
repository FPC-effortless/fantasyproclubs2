-- Create featured_content table
CREATE TABLE public.featured_content (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one row
    featured_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    featured_competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.featured_content
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Grant access to authenticated users
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to manage featured content
CREATE POLICY "Allow admins to manage featured content"
    ON public.featured_content
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

-- Policy to allow public to view featured content
CREATE POLICY "Allow public to view featured content"
    ON public.featured_content
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Insert initial row
INSERT INTO public.featured_content (id) VALUES (1); 