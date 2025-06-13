-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id bigint PRIMARY KEY DEFAULT 1,
  email_settings jsonb DEFAULT '{
    "smtpHost": "",
    "smtpPort": "",
    "smtpUser": "",
    "smtpPassword": "",
    "senderEmail": "",
    "enableEmailNotifications": true
  }'::jsonb,
  notification_settings jsonb DEFAULT '{
    "enablePushNotifications": true,
    "enableInAppNotifications": true,
    "matchReminders": true,
    "competitionUpdates": true,
    "teamUpdates": true
  }'::jsonb,
  security_settings jsonb DEFAULT '{
    "minPasswordLength": 8,
    "requireSpecialChars": true,
    "requireNumbers": true,
    "maxLoginAttempts": 5,
    "sessionTimeout": 30,
    "enableTwoFactor": false
  }'::jsonb,
  integration_settings jsonb DEFAULT '{
    "discordWebhook": "",
    "twitchApiKey": "",
    "enableDiscordIntegration": false,
    "enableTwitchIntegration": false
  }'::jsonb,
  backup_settings jsonb DEFAULT '{
    "enableAutoBackup": true,
    "backupFrequency": "daily",
    "backupRetentionDays": 30,
    "includeUserData": true,
    "includeMatchHistory": true
  }'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_settings_record CHECK (id = 1)
);

-- Insert default settings
INSERT INTO system_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to system settings" ON system_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )); 