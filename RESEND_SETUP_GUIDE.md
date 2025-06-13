# 🚀 Complete Resend Email Setup Guide

## ✅ Current Status

Your EA FC Pro Clubs app is **ready for Resend email integration**! Here's what's already implemented:

- ✅ **Signup form** with favorite team selection
- ✅ **Email service code** (`lib/email/email-service.ts`)
- ✅ **Professional email templates** with EA FC Pro Clubs branding
- ✅ **Email verification page** (`/auth/verify-email`)
- ✅ **Environment configuration** (`.env.local`)
- ✅ **Resend package** installed
- ✅ **Setup scripts** ready to run

## 🎯 Quick Setup (5 Minutes)

### Step 1: Get Your Resend API Key

1. **Sign up at**: https://resend.com (Free: 3,000 emails/month)
2. **Go to**: Dashboard > API Keys
3. **Create new API key**
4. **Copy the key** (starts with "re_")

### Step 2: Add API Key to Environment

Edit your `.env.local` file and replace:
```env
RESEND_API_KEY=your_resend_api_key_here
```

With your actual API key:
```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Configure Supabase SMTP

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: `rnihbbrrqnvfruqaglmm`
3. **Navigate to**: Authentication > Settings > SMTP Settings
4. **Configure**:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [Your Resend API Key]
   Sender Email: noreply@yourdomain.com
   Sender Name: EA FC Pro Clubs
   ```

### Step 4: Test the Setup

```bash
npm run test:email
```

### Step 5: Test Signup Flow

1. Start your dev server: `npm run dev`
2. Go to: http://localhost:3000/login
3. Click "Register" tab
4. Fill out the form **including selecting a favorite team**
5. Submit and check your email for verification link

## 🎨 User Experience Flow

### What Happens When a User Signs Up:

1. **User fills signup form**:
   - Name, email, password
   - Phone number (optional)
   - Date of birth (optional)
   - **Favorite team selection** 🏆
   - User type (fan/player/manager)

2. **Account creation**:
   - User profile created in database
   - **Favorite team stored** in `user_profiles.team_id`
   - User metadata includes all form data

3. **Email verification**:
   - Professional verification email sent via Resend
   - User redirected to `/auth/verify-email` page
   - Clear instructions and resend option

4. **After verification**:
   - User can log in
   - Their favorite team is part of their profile
   - Ready for personalized experience

## 📧 Email Templates

Your app includes professional email templates for:

- ✅ **Email Verification** - Welcome message with verification link
- ✅ **Password Reset** - Secure reset instructions
- ✅ **Welcome Email** - After verification complete
- ✅ **Match Notifications** - For favorite team updates
- ✅ **Team Invitations** - Join team requests
- ✅ **General Notifications** - System announcements

## 🛡️ Domain Setup (Optional but Recommended)

### For Better Email Deliverability:

1. **Add domain in Resend Dashboard**:
   - Go to Domains section
   - Add your domain (e.g., `yourdomain.com`)

2. **Add DNS records** (provided by Resend):
   ```dns
   TXT: v=spf1 include:spf.resend.com ~all
   CNAME: resend._domainkey -> resend._domainkey.resend.com
   ```

3. **Update sender email**:
   ```
   Sender Email: noreply@yourdomain.com
   ```

## 🧪 Testing & Troubleshooting

### Test Commands:
```bash
npm run setup:resend    # Setup guide and create .env.local
npm run test:email      # Test email service
npm run dev            # Start development server
```

### Common Issues:

**Emails not sending?**
- ✅ Check API key is correct in `.env.local`
- ✅ Verify Supabase SMTP configuration
- ✅ Check Resend dashboard for logs

**Emails going to spam?**
- ✅ Set up domain authentication
- ✅ Use a proper sender email
- ✅ Test with different email providers

**Signup errors?**
- ✅ Check browser console for errors
- ✅ Verify all environment variables are set
- ✅ Test database connection

### Debug Steps:
1. Check browser Network tab for API errors
2. Check Supabase dashboard Authentication logs
3. Check Resend dashboard for delivery status
4. Verify `.env.local` variables are loaded

## 🎯 Production Deployment

### Environment Variables for Production:
```env
RESEND_API_KEY=re_your_production_api_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Production Config:
- Use your production domain in email templates
- Set up proper redirect URLs
- Configure rate limiting if needed

## 🏆 Favorite Team Feature

### How It Works:

1. **During Signup**:
   - Form fetches available teams from database
   - User selects their favorite team (optional)
   - Choice stored in user metadata

2. **Database Storage**:
   - Stored in `user_profiles.team_id` field
   - References `teams.id` with foreign key
   - Automatically handled by signup trigger

3. **Future Use Cases**:
   - Team-specific news and updates
   - Match notifications for favorite team
   - Personalized content
   - Fan engagement features

### Database Query Examples:
```sql
-- Get users by favorite team
SELECT * FROM user_profiles WHERE team_id = 'team-uuid';

-- Get user with their favorite team info
SELECT up.*, t.name as favorite_team_name 
FROM user_profiles up 
LEFT JOIN teams t ON up.team_id = t.id 
WHERE up.id = 'user-uuid';
```

## 📱 Mobile & Responsive

All email templates are mobile-responsive and work great on:
- 📱 Mobile devices
- 💻 Desktop email clients
- 🌐 Webmail (Gmail, Yahoo, Outlook)
- 📧 Dark/light mode support

## 💡 Pro Tips

1. **Monitor Analytics**: Check Resend dashboard for open/click rates
2. **A/B Test**: Try different email subject lines
3. **Personalization**: Use user's name and favorite team in emails
4. **Timing**: Send match notifications at optimal times
5. **Segmentation**: Group users by favorite teams for targeted emails

## 🎉 You're All Set!

Once you complete the setup steps above, your EA FC Pro Clubs app will have:

- ✅ Professional email verification system
- ✅ Favorite team selection during signup
- ✅ Beautiful, branded email templates
- ✅ Reliable email delivery via Resend
- ✅ Great user experience
- ✅ Foundation for future email features

## 🆘 Need Help?

- 📖 Check existing documentation files
- 🔍 Search Resend documentation: https://resend.com/docs
- 🐛 Check browser console for JavaScript errors
- 📧 Test with different email providers
- 🚀 Start with a simple test email first

---

**Ready to launch your EA FC Pro Clubs app with professional email system! ⚽🚀** 