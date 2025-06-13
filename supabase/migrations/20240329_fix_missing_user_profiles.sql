-- Function to handle missing user profiles
CREATE OR REPLACE FUNCTION public.fix_missing_user_profiles()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through auth.users that don't have corresponding user_profiles
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.id
        WHERE up.id IS NULL
    LOOP
        -- Insert missing user profile
        INSERT INTO public.user_profiles (
            id,
            display_name,
            username,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
            COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
            'fan',
            NOW(),
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT public.fix_missing_user_profiles();

-- Drop the function after use
DROP FUNCTION public.fix_missing_user_profiles(); 