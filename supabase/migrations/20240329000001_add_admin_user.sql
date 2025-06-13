-- Create admin user
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Create auth user for admin
    SELECT id INTO v_user_id FROM auth.create_user(
        jsonb_build_object(
            'email', 'admin@test.com',
            'password', 'Test123!',
            'email_confirm', true,
            'user_metadata', jsonb_build_object(
                'full_name', 'Admin User',
                'username', 'admin'
            )
        )
    );

    -- Create admin profile
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        full_name,
        user_type,
        preferred_platform,
        platform_verified,
        experience_level
    )
    VALUES (
        v_user_id,
        'admin@test.com',
        'admin',
        'Admin User',
        'admin',
        'both',
        true,
        'professional'
    );
END $$; 