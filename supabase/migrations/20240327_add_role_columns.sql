-- Add role and user_type columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user';

-- Update existing users to have admin role (you can modify this as needed)
UPDATE public.user_profiles
SET role = 'admin', user_type = 'admin'
WHERE id IN (
    SELECT id 
    FROM public.user_profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.role IS 'User role (admin, user, etc.)';
COMMENT ON COLUMN public.user_profiles.user_type IS 'User type (admin, user, etc.)'; 