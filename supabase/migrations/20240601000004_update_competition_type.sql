-- Drop the existing type constraint
ALTER TABLE public.competitions DROP CONSTRAINT IF EXISTS competitions_type_check;

-- Add the new type constraint including 'swiss'
ALTER TABLE public.competitions ADD CONSTRAINT competitions_type_check CHECK (type IN ('league', 'cup', 'friendly', 'swiss')); 