# Disable Email Confirmation - Quick Fix

To fix the signup error temporarily, you need to disable email confirmation in your Supabase project.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rnihbbrrqnvfruqaglmm`
3. Navigate to **Authentication** → **Settings**
4. Find **"Email confirmations"** section
5. **Turn OFF** "Enable email confirmations"
6. Click **Save**

## Option 2: Supabase CLI (if you have it installed)

```bash
# Set email confirmation to false
supabase settings update --project-ref rnihbbrrqnvfruqaglmm --email-confirm false
```

## Option 3: SQL Update (Advanced)

Run this in your Supabase SQL Editor:

```sql
-- Disable email confirmation
UPDATE auth.config 
SET email_confirm_enabled = false 
WHERE id = 1;

-- Allow users to sign in without email confirmation
UPDATE auth.config 
SET email_confirm_grace_period = 0 
WHERE id = 1;
```

## After Disabling Email Confirmation

1. Users can sign up and immediately log in
2. No email verification required
3. Perfect for development/testing
4. You can re-enable it later when email service is configured

## To Re-enable Later (when email service is set up)

1. Configure SMTP settings in Supabase
2. Set up email templates
3. Re-enable email confirmations
4. Test the email flow

## Current Status

- ✅ Signup form updated to handle email errors gracefully
- ✅ Better error messages for users
- ✅ Fallback authentication flow
- ⏳ Need to disable email confirmation in Supabase dashboard

## Next Steps

1. Disable email confirmation using Option 1 above
2. Test signup flow
3. Configure email service later (optional) 