-- Add missing columns to competitions table
ALTER TABLE public.competitions 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS entry_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rules TEXT;

-- Grant appropriate permissions
GRANT ALL ON public.competitions TO authenticated;
GRANT ALL ON public.competitions TO service_role;

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Add explicit comment to help with schema caching
COMMENT ON COLUMN public.competitions.description IS 'Competition description text';
COMMENT ON COLUMN public.competitions.entry_fee IS 'Entry fee for the competition';
COMMENT ON COLUMN public.competitions.prize_pool IS 'Total prize pool for the competition';
COMMENT ON COLUMN public.competitions.rules IS 'Competition rules and guidelines'; 