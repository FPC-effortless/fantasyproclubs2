# Fantasy Pro Clubs - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Resend account for emails (free tier: 3,000 emails/month)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd fpc-clubs-app

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fantasy Pro Clubs

# Email Configuration
EMAIL_FROM=Fantasy Pro Clubs <noreply@fantasyproclubs.com>
```

### 3. Email Setup with Resend

#### Option A: Automated Setup
```bash
npm run setup:resend
```

This will:
- Create `.env.local` if it doesn't exist
- Guide you through adding your Resend API key
- Provide instructions for Supabase SMTP configuration

#### Option B: Manual Setup

1. **Get Resend API Key**
   - Sign up at [https://resend.com](https://resend.com)
   - Go to Dashboard > API Keys
   - Create new API key
   - Copy the key (starts with "re_")

2. **Configure Supabase SMTP**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Settings > SMTP Settings
   - Configure:
     ```
     SMTP Host: smtp.resend.com
     SMTP Port: 587
     SMTP User: resend
     SMTP Password: [Your Resend API Key]
     Sender Email: noreply@yourdomain.com
     Sender Name: Fantasy Pro Clubs
     ```

3. **Test Email Setup**
   ```bash
   npm run test:email
   ```

### 4. Database Setup

Run the necessary SQL migrations in your Supabase SQL editor:

1. **Basic Tables Setup**
   - Run the SQL from `supabase/migrations/` files in order

2. **Fix Database Issues**
   - If you see database errors, run:
     ```sql
     -- Copy content from fix_database.sql
     ```

### 5. Start Development Server

```bash
npm run dev
```

Your app will be available at [http://localhost:3001](http://localhost:3001)

## 📧 Email Features

### Available Email Templates
- **Email Verification**: Sent when users sign up
- **Password Reset**: Sent when users request password reset
- **Welcome Email**: Sent after email verification
- **Match Notifications**: For upcoming matches
- **Team Invitations**: When invited to join a team

### Email Flow
1. User signs up → Verification email sent
2. User clicks verification link → Account activated
3. User can request password reset → Reset email sent
4. User clicks reset link → Can set new password

## 🔐 Authentication Features

### Email-Only Authentication
- No social logins (Google/Discord removed)
- Email/password registration
- Email verification required
- Password reset functionality
- Session management

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role
- `/profile/*` - Requires authentication
- `/fantasy/*` - Some features require auth

## 🛠️ Troubleshooting

### Common Issues

**Emails not sending?**
- Check Resend API key in `.env.local`
- Verify Supabase SMTP configuration
- Check Resend dashboard for logs
- Ensure you're not hitting rate limits

**Database errors?**
- Run migration scripts in order
- Check Supabase logs for RLS policy issues
- Ensure all required columns exist

**Authentication issues?**
- Clear browser cookies/cache
- Check Supabase Auth settings
- Verify redirect URLs are configured

### Debug Commands
```bash
# Test email service
npm run test:email

# Check for security issues
npm run security-check

# Run tests
npm test

# Type checking
npm run type-check
```

## 🚀 Production Deployment

### Environment Variables
Update these for production:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
EMAIL_FROM=Fantasy Pro Clubs <noreply@yourdomain.com>
```

### Supabase Configuration
1. Add production URL to redirect URLs
2. Configure custom SMTP domain
3. Enable RLS policies
4. Set up database backups

### Vercel Deployment
1. Connect GitHub repository
2. Add environment variables
3. Deploy

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check Supabase and Resend dashboards
4. Open an issue on GitHub

---

Happy coding! ⚽🎮 