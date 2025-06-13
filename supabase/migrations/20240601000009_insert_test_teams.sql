-- Insert test teams only (assuming tables and policies already exist)
DO $$
DECLARE
    v_manager_id UUID;
    v_team_count INTEGER := 0;
BEGIN
    -- Start transaction and disable triggers temporarily
    SET session_replication_role = 'replica';

    -- Delete existing teams to avoid duplicates
    DELETE FROM public.teams;

    -- Create 12 teams, one for each manager
    FOR i IN 1..12 LOOP
        -- Get a manager ID
        SELECT id INTO v_manager_id 
        FROM public.user_profiles 
        WHERE user_type = 'manager' 
        AND username = 'manager' || i 
        LIMIT 1;

        IF v_manager_id IS NOT NULL THEN
            -- Create team
            INSERT INTO public.teams (
                name,
                short_name,
                logo_url,
                description,
                manager_id,
                created_at,
                updated_at
            )
            VALUES (
                'Test Team ' || i,
                'TT' || i,  -- Adding short name
                'https://picsum.photos/200/200?random=' || i, -- Random placeholder image
                'This is test team ' || i || '. A competitive team looking for players.',
                v_manager_id,
                NOW(),
                NOW()
            );
        END IF;
    END LOOP;

    -- Re-enable triggers
    SET session_replication_role = 'origin';

    -- Output summary
    SELECT COUNT(*) INTO v_team_count FROM public.teams;
    RAISE NOTICE 'Created % teams', v_team_count;
END $$; 