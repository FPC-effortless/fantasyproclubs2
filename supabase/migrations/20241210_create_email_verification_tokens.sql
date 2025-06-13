-- Create email_verification_tokens table for custom email verification
CREATE TABLE email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Add RLS policies
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tokens
CREATE POLICY "Users can view their own verification tokens" ON email_verification_tokens
  FOR SELECT USING (user_id = auth.uid());

-- Policy: System can insert tokens (via service role)
CREATE POLICY "System can insert verification tokens" ON email_verification_tokens
  FOR INSERT WITH CHECK (true);

-- Policy: System can update tokens (via service role)
CREATE POLICY "System can update verification tokens" ON email_verification_tokens
  FOR UPDATE USING (true);

-- Policy: System can delete tokens (via service role)
CREATE POLICY "System can delete verification tokens" ON email_verification_tokens
  FOR DELETE USING (true);

-- Add email_verified column to user_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing users to have email_verified = true (assuming they were verified via old system)
-- You can comment this out if you want to require re-verification for existing users
UPDATE user_profiles SET email_verified = true WHERE email_verified IS NULL;

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled function to run cleanup (optional - requires pg_cron extension)
-- This will clean up expired tokens daily
-- Uncomment the line below if you have pg_cron extension enabled:
-- SELECT cron.schedule('cleanup-verification-tokens', '0 2 * * *', 'SELECT cleanup_expired_verification_tokens();');

-- Alternative: You can manually run cleanup_expired_verification_tokens() periodically
-- Or call it from your application code 