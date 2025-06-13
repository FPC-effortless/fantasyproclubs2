# 🚀 Custom Domain Email Setup for EA FC Pro Clubs

This guide will help you set up professional email verification from your own domain using Supabase and either Vercel or external email services.

## 📋 Prerequisites

1. **Custom Domain**: You need to own a domain (e.g., `eafcproclubs.com`)
2. **Vercel Account**: For hosting and potential email services
3. **Supabase Project**: Your existing project
4. **Email Service Provider**: Choose one of the options below

## 🎯 Option 1: Using Vercel Email (Recommended for Vercel hosting)

### Step 1: Domain Setup in Vercel

1. **Add Domain to Vercel**:
   ```bash
   # If you haven't already, add your domain in Vercel dashboard
   # Go to: Project Settings > Domains
   # Add: eafcproclubs.com (or your domain)
   ```

2. **Configure DNS Records**:
   ```dns
   # Add these DNS records to your domain provider
   Type: A
   Name: @
   Value: 76.76.19.19

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 2: Email Service Setup

Since Vercel doesn't provide native email services, we'll use **Resend** (recommended) or **SendGrid**.

#### Option A: Resend (Recommended - Simple & Affordable)

1. **Sign up for Resend**: https://resend.com
2. **Add your domain**:
   ```bash
   # Go to Resend Dashboard > Domains
   # Add your domain: eafcproclubs.com
   ```

3. **Verify Domain DNS**:
   ```dns
   # Add these DNS records to your domain
   Type: TXT
   Name: @
   Value: "v=spf1 include:spf.resend.com ~all"

   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.resend.com

   Type: MX
   Name: @
   Value: feedback-smtp.resend.com (Priority: 10)
   ```

4. **Get API Key**:
   ```bash
   # Go to Resend Dashboard > API Keys
   # Create new API key and save it securely
   ```

#### Option B: SendGrid

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Verify domain in SendGrid**:
   ```bash
   # Go to SendGrid > Settings > Sender Authentication
   # Authenticate your domain
   ```

3. **Add DNS Records** (SendGrid will provide these)
4. **Get API Key** from SendGrid dashboard

### Step 3: Environment Variables

Add these to your Vercel environment variables and `.env.local`:

```env
# For Resend
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_SITE_URL=https://eafcproclubs.com

# For SendGrid (alternative)
SENDGRID_API_KEY=SG.your_api_key_here
```

### Step 4: Supabase Email Configuration

1. **Go to Supabase Dashboard**:
   - Project Settings > Authentication > Email Templates

2. **Configure SMTP Settings**:

   **For Resend**:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [Your Resend API Key]
   Sender Email: noreply@eafcproclubs.com
   Sender Name: EA FC Pro Clubs
   ```

   **For SendGrid**:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [Your SendGrid API Key]
   Sender Email: noreply@eafcproclubs.com
   Sender Name: EA FC Pro Clubs
   ```

### Step 5: Custom Email Templates

1. **Update Email Templates in Supabase**:

   **Confirmation Email Template**:
   ```html
   <h1>Welcome to EA FC Pro Clubs!</h1>
   <p>Thanks for joining the ultimate football club management experience.</p>
   <p>Please confirm your email address by clicking the button below:</p>
   <a href="{{ .ConfirmationURL }}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
     Verify Your Email
   </a>
   <p>If the button doesn't work, copy and paste this link: {{ .ConfirmationURL }}</p>
   <p>Welcome to the pitch!</p>
   <p>- The EA FC Pro Clubs Team</p>
   ```

   **Recovery Email Template**:
   ```html
   <h1>Reset Your Password</h1>
   <p>Someone requested a password reset for your EA FC Pro Clubs account.</p>
   <p>If this was you, click the button below to reset your password:</p>
   <a href="{{ .ConfirmationURL }}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
     Reset Password
   </a>
   <p>If you didn't request this, you can safely ignore this email.</p>
   <p>- The EA FC Pro Clubs Team</p>
   ```

## 🔗 Option 2: Using External Email Service (More Control)

### Step 1: Choose an Email Service

**Professional Options**:
- **Microsoft 365** ($6/month per user)
- **Google Workspace** ($6/month per user)
- **Zoho Mail** ($1/month per user)

### Step 2: DNS Configuration

```dns
# Example for Microsoft 365
Type: MX
Name: @
Value: yourdomain-com.mail.protection.outlook.com (Priority: 0)

Type: CNAME
Name: autodiscover
Value: autodiscover.outlook.com

Type: TXT
Name: @
Value: "v=spf1 include:spf.protection.outlook.com ~all"
```

### Step 3: Create Email Account

Create: `noreply@eafcproclubs.com` or `support@eafcproclubs.com`

### Step 4: Configure Supabase SMTP

```
SMTP Host: smtp-mail.outlook.com (for Microsoft 365)
SMTP Port: 587
SMTP User: noreply@eafcproclubs.com
SMTP Password: [Your email password]
Sender Email: noreply@eafcproclubs.com
Sender Name: EA FC Pro Clubs
```

## ⚡ Quick Setup with Resend (Fastest Option)

If you want to get started quickly:

1. **Sign up for Resend**: https://resend.com (Free tier: 3,000 emails/month)
2. **Add domain** and verify DNS records
3. **Get API key**
4. **Configure Supabase** with Resend SMTP settings
5. **Test** by signing up a new user

## 🧪 Testing Your Setup

1. **Test Email Delivery**:
   ```javascript
   // Create a test user
   const { error } = await supabase.auth.signUp({
     email: 'test@youremail.com',
     password: 'testpassword123'
   })
   ```

2. **Check Email Deliverability**:
   - Test with Gmail, Yahoo, Outlook
   - Check spam folders
   - Verify links work correctly

3. **Monitor Email Analytics**:
   - Resend/SendGrid provide delivery reports
   - Track open rates and click rates

## 🔒 Security Best Practices

1. **SPF Record**: Prevents email spoofing
2. **DKIM**: Authenticates email sender
3. **DMARC**: Additional security layer
4. **SSL/TLS**: Encrypt email transmission

## 📱 Vercel-Specific Considerations

1. **Environment Variables**:
   - Set in Vercel dashboard
   - Use production and preview environments

2. **Domain SSL**:
   - Vercel automatically provides SSL certificates
   - Ensure HTTPS for email links

3. **Functions**:
   - Can create custom email sending functions if needed
   - Use Vercel Edge Functions for better performance

## 🎯 Recommended Setup for Your Project

Based on your current setup, I recommend:

1. **Use Resend** for email service (cost-effective, reliable)
2. **Keep Vercel** for hosting
3. **Configure Supabase SMTP** with Resend credentials
4. **Customize email templates** to match your brand

This setup will give you:
- ✅ Professional emails from your domain
- ✅ High deliverability rates
- ✅ Cost-effective solution ($0-20/month)
- ✅ Easy management and monitoring
- ✅ Scales with your user base

## 🆘 Troubleshooting

**Common Issues**:
- DNS propagation takes 24-48 hours
- Check spam folders during testing
- Verify SMTP credentials are correct
- Ensure SSL/TLS is enabled
- Test with multiple email providers

Need help? The setup should take 30-60 minutes once DNS is configured! 