-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to competitions
CREATE POLICY "Allow public read access to competitions"
ON public.competitions
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create competitions
CREATE POLICY "Allow authenticated users to create competitions"
ON public.competitions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own competitions
CREATE POLICY "Allow authenticated users to update their own competitions"
ON public.competitions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true); 