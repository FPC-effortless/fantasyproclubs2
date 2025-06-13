-- Update the user's role to admin
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = auth.uid(); 