-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email_settings JSONB NOT NULL DEFAULT '{
        "smtpHost": "",
        "smtpPort": "",
        "smtpUser": "",
        "smtpPassword": "",
        "senderEmail": "",
        "enableEmailNotifications": false
    }',
    notification_settings JSONB NOT NULL DEFAULT '{
        "enablePushNotifications": false,
        "enableInAppNotifications": true,
        "matchReminders": true,
        "competitionUpdates": true,
        "teamUpdates": true
    }',
    security_settings JSONB NOT NULL DEFAULT '{
        "minPasswordLength": 8,
        "requireSpecialChars": true,
        "requireNumbers": true,
        "maxLoginAttempts": 5,
        "sessionTimeout": 60,
        "enableTwoFactor": false
    }',
    integration_settings JSONB NOT NULL DEFAULT '{
        "discordWebhook": "",
        "twitchApiKey": "",
        "enableDiscordIntegration": false,
        "enableTwitchIntegration": false
    }',
    backup_settings JSONB NOT NULL DEFAULT '{
        "enableAutoBackup": true,
        "backupFrequency": "daily",
        "backupRetentionDays": 30,
        "includeUserData": true,
        "includeMatchHistory": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read system settings"
    ON system_settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins to update system settings"
    ON system_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    ); 