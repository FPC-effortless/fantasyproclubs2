-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres;
GRANT EXECUTE ON FUNCTION auth.create_user(jsonb) TO postgres;

-- Create test users
DO $$
DECLARE
    v_user_id UUID;
    v_manager_count INTEGER := 0;
    v_player_count INTEGER := 0;
    v_display_name TEXT;
    v_email TEXT;
    v_user_type TEXT;
    v_password TEXT := 'Test123!';
BEGIN
    -- Start transaction and disable triggers temporarily
    SET session_replication_role = 'replica';

    -- Create 12 manager accounts
    FOR i IN 1..12 LOOP
        -- Generate unique email and display name for manager
        v_display_name := 'Manager ' || i;
        v_email := 'manager' || i || '@test.com';
        
        -- Create auth user
        SELECT id INTO v_user_id FROM auth.create_user(
            jsonb_build_object(
                'email', v_email,
                'password', v_password,
                'email_confirm', true,
                'user_metadata', jsonb_build_object(
                    'full_name', v_display_name,
                    'username', 'manager' || i
                )
            )
        );
        
        -- Create user profile
        INSERT INTO public.user_profiles (
            id,
            email,
            username,
            full_name,
            user_type,
            xbox_gamertag,
            psn_id,
            preferred_platform,
            platform_verified,
            experience_level
        )
        VALUES (
            v_user_id,
            v_email,
            'manager' || i,
            v_display_name,
            'manager',
            CASE (i % 2) WHEN 0 THEN 'XboxManager' || i ELSE NULL END,
            CASE (i % 2) WHEN 1 THEN 'PSNManager' || i ELSE NULL END,
            CASE (i % 2) WHEN 0 THEN 'xbox' ELSE 'playstation' END,
            false,
            'professional'
        );
    END LOOP;

    -- Create 1 fan account
    v_display_name := 'Super Fan';
    v_email := 'fan@test.com';

    -- Create auth user for fan
    SELECT id INTO v_user_id FROM auth.create_user(
        jsonb_build_object(
            'email', v_email,
            'password', v_password,
            'email_confirm', true,
            'user_metadata', jsonb_build_object(
                'full_name', v_display_name,
                'username', 'superfan'
            )
        )
    );

    -- Create fan profile
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        full_name,
        user_type,
        preferred_platform,
        platform_verified
    )
    VALUES (
        v_user_id,
        v_email,
        'superfan',
        v_display_name,
        'fan',
        'both',
        false
    );

    -- Create 180 player accounts
    FOR i IN 1..180 LOOP
        -- Generate unique email and display name for player
        v_display_name := 'Player ' || i;
        v_email := 'player' || i || '@test.com';

        -- Create auth user for player
        SELECT id INTO v_user_id FROM auth.create_user(
            jsonb_build_object(
                'email', v_email,
                'password', v_password,
                'email_confirm', true,
                'user_metadata', jsonb_build_object(
                    'full_name', v_display_name,
                    'username', 'player' || i
                )
            )
        );

        -- Create player profile
        INSERT INTO public.user_profiles (
            id,
            email,
            username,
            full_name,
            user_type,
            xbox_gamertag,
            psn_id,
            preferred_platform,
            platform_verified,
            experience_level
        )
        VALUES (
            v_user_id,
            v_email,
            'player' || i,
            v_display_name,
            'player',
            CASE (i % 3) WHEN 0 THEN 'XboxPlayer' || i ELSE NULL END,
            CASE (i % 3) WHEN 1 THEN 'PSNPlayer' || i ELSE NULL END,
            CASE (i % 3) 
                WHEN 0 THEN 'xbox'
                WHEN 1 THEN 'playstation'
                ELSE 'both'
            END,
            false,
            CASE (i % 4)
                WHEN 0 THEN 'beginner'
                WHEN 1 THEN 'intermediate'
                WHEN 2 THEN 'advanced'
                ELSE 'professional'
            END
        );
    END LOOP;

    -- Re-enable triggers
    SET session_replication_role = 'origin';

    -- Output summary
    SELECT COUNT(*) INTO v_manager_count FROM public.user_profiles WHERE user_type = 'manager';
    SELECT COUNT(*) INTO v_player_count FROM public.user_profiles WHERE user_type = 'player';
    
    RAISE NOTICE 'Created % managers, 1 fan, and % players', v_manager_count, v_player_count;
END $$; 