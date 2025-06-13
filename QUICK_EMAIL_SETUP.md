# ⚡ Quick Email Setup for EA FC Pro Clubs

## 🎯 What You Have Already ✅

Your project already includes:
- ✅ Email verification page (`/auth/verify-email`)
- ✅ Callback handler (`/auth/callback`)
- ✅ Signup flow redirects to verification
- ✅ Professional email templates
- ✅ Resend functionality

## 🚀 Setup Steps (Choose One Option)

### Option 1: Resend (Recommended - 5 minutes setup)

1. **Sign up for Resend**: https://resend.com
   - Free tier: 3,000 emails/month
   - Perfect for getting started

2. **Add your domain** in Resend dashboard
   - Domain: `yourdomain.com`
   - Follow DNS verification steps

3. **Add environment variables** to Vercel:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. **Configure Supabase SMTP**:
   - Go to: Supabase Dashboard > Authentication > Settings
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `587`
   - SMTP User: `resend`
   - SMTP Password: `[Your Resend API Key]`
   - Sender Email: `noreply@yourdomain.com`
   - Sender Name: `EA FC Pro Clubs`

### Option 2: SendGrid (Alternative)

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Verify domain** in SendGrid dashboard
3. **Configure Supabase SMTP**:
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey`
   - SMTP Password: `[Your SendGrid API Key]`

### Option 3: Gmail (Quick Test)

For testing only (not recommended for production):

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**: Gmail Settings > Security > App passwords
3. **Configure Supabase SMTP**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: `your-email@gmail.com`
   - SMTP Password: `[Your App Password]`

## 🎨 Custom Email Templates

Upload these templates in Supabase:

1. **Confirmation Email**: Copy content from `email-templates/confirmation.html`
2. **Password Reset**: Copy content from `email-templates/password-reset.html`

**Where to add**:
- Supabase Dashboard > Authentication > Email Templates
- Paste HTML content and save

## 🧪 Testing

1. **Test signup**:
   ```bash
   # Run the test script
   node scripts/test-email-verification.js
   ```

2. **Manual test**:
   - Go to `/auth/signup`
   - Create account with real email
   - Check email arrives correctly
   - Verify links work

## 🔧 Troubleshooting

**Email not arriving?**
- Check Supabase logs: Dashboard > Logs
- Verify SMTP credentials
- Check spam folder
- Test with different email providers

**Links not working?**
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check callback URL in Supabase: `https://yourdomain.com/auth/callback`
- Ensure HTTPS is working

**DNS issues?**
- DNS changes take 24-48 hours
- Use online DNS checkers
- Verify all required records are added

## 🎯 Production Checklist

Before going live:
- [ ] Domain verified and SSL working
- [ ] Email service configured (Resend/SendGrid)
- [ ] SMTP settings tested in Supabase
- [ ] Custom email templates uploaded
- [ ] Environment variables set in Vercel
- [ ] Test with multiple email providers
- [ ] Monitor email delivery rates

## 💡 Pro Tips

1. **Use Resend** - simplest setup, great deliverability
2. **Test thoroughly** - different email providers behave differently
3. **Monitor delivery** - check bounce rates and spam reports
4. **Professional domain** - improves trust and deliverability
5. **Keep templates updated** - match your app's branding

Your email verification system is already built - you just need to configure the email service! 🚀 