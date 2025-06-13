-- Step 1: Add user_type column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('admin', 'manager', 'player', 'fan')) NOT NULL DEFAULT 'fan';

-- Step 2: Migrate data from role to user_type
UPDATE user_profiles SET user_type = CASE 
    WHEN role = 'admin' THEN 'admin'
    WHEN role = 'manager' THEN 'manager'
    WHEN role = 'player' THEN 'player'
    ELSE 'fan'
END;

-- Step 3: Drop role column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;

-- Step 4: Update policies to use user_type instead of role
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles"
    ON user_profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Step 5: Update system_settings policies
DROP POLICY IF EXISTS "Allow admins full access to system settings" ON system_settings;
CREATE POLICY "Allow admins full access to system settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    ); 