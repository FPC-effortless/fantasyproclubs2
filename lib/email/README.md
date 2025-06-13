# Fantasy Pro Clubs Email Service

A comprehensive email utility for sending professional emails using Resend API. This service provides pre-built templates and methods for common email types like verification, password reset, welcome messages, and notifications.

## Features

- 🎨 **Professional Templates** - Beautiful, responsive email templates with Fantasy Pro Clubs branding
- 📧 **Multiple Email Types** - Support for verification, password reset, welcome, notifications, and more
- 🔄 **Bulk Email Support** - Send emails to multiple recipients efficiently
- 🛡️ **Type Safety** - Full TypeScript support with proper type definitions
- ♻️ **Retry Logic** - Built-in error handling and retry mechanisms
- 📱 **Mobile Responsive** - All emails look great on desktop and mobile devices

## Setup

1. **Install Dependencies**
   ```bash
   npm install resend
   ```

2. **Environment Variables**
   Add your Resend API key to your `.env.local` file:
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   ```

3. **Import the Service**
   ```typescript
   import { EmailService } from '@/lib/email/email-service';
   ```

## Available Email Types

### 1. Email Verification
Send a verification email to new users:

```typescript
await EmailService.sendVerificationEmail({
  to: 'user@example.com',
  userName: 'John Doe',
  token: 'verification_token_here'
});
```

### 2. Password Reset
Send password reset instructions:

```typescript
await EmailService.sendPasswordResetEmail({
  to: 'user@example.com',
  userName: 'John Doe',
  token: 'reset_token_here'
});
```

### 3. Welcome Email
Send a welcome message after email verification:

```typescript
await EmailService.sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'John Doe'
});
```

### 4. Match Notifications
Notify users about upcoming matches:

```typescript
await EmailService.sendMatchNotification({
  to: 'player@example.com',
  userName: 'John Doe',
  matchDetails: {
    homeTeam: 'Manchester City FC',
    awayTeam: 'Liverpool FC',
    date: 'March 15, 2024',
    time: '3:00 PM GMT',
    competition: 'Premier League'
  },
  matchId: 'match_123'
});
```

### 5. Team Invitations
Send team invitation emails:

```typescript
await EmailService.sendTeamInvitation({
  to: 'player@example.com',
  userName: 'John Doe',
  teamName: 'Manchester United',
  inviterName: 'Team Manager',
  invitationId: 'invitation_456'
});
```

### 6. Custom Notifications
Send custom notification emails:

```typescript
await EmailService.sendNotification({
  to: 'user@example.com',
  userName: 'John Doe',
  title: 'Transfer Completed',
  message: 'Your transfer request has been approved!',
  actionUrl: 'https://fantasyproclubs.com/transfers/123',
  actionText: 'View Transfer'
});
```

### 7. Bulk Emails
Send emails to multiple recipients:

```typescript
await EmailService.sendBulkEmail({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ],
  subject: 'Season Update',
  title: 'New Season Starting',
  message: 'Get ready for the new season!',
  actionUrl: 'https://fantasyproclubs.com/season',
  actionText: 'View Details'
});
```

## API Integration Examples

### Next.js API Route Example

```typescript
// app/api/auth/send-verification/route.ts
import { EmailService } from '@/lib/email/email-service';

export async function POST(request: Request) {
  try {
    const { email, userName, token } = await request.json();
    
    await EmailService.sendVerificationEmail({
      to: email,
      userName,
      token
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

### Supabase Auth Integration

```typescript
// lib/auth/email-handlers.ts
import { EmailService } from '@/lib/email/email-service';

export const handleSignUp = async (email: string, userData: any) => {
  // Generate verification token
  const verificationToken = generateToken();
  
  // Send verification email
  await EmailService.sendVerificationEmail({
    to: email,
    userName: userData.full_name,
    token: verificationToken
  });
  
  // Store token in database for verification
  // ...
};
```

## Error Handling

The email service includes built-in error handling. You can also implement retry logic:

```typescript
import { sendEmailWithRetry } from '@/lib/email/examples';

// Send email with retry logic
await sendEmailWithRetry(() => 
  EmailService.sendVerificationEmail({
    to: 'user@example.com',
    userName: 'John Doe',
    token: 'token_123'
  }),
  3, // max retries
  1000 // delay between retries (ms)
);
```

## Email Templates

All emails use a consistent, professional design with:

- **Fantasy Pro Clubs branding** with gradient header
- **Mobile-responsive design** that looks great on all devices
- **Clear call-to-action buttons** with hover effects
- **Consistent typography** and color scheme
- **Professional footer** with company information

### Template Customization

You can customize the base template by modifying the `createEmailTemplate` function in `email-service.ts`:

```typescript
const createEmailTemplate = (content: string, title: string) => {
  // Customize colors, fonts, layout, etc.
  return `<!-- Your custom template HTML -->`;
};
```

## Configuration

The service uses these default configurations:

- **From Email**: `Fantasy Pro Clubs <noreply@fantasyproclubs.com>`
- **Website URL**: `https://fantasyproclubs.com`
- **App Name**: `Fantasy Pro Clubs`

You can modify these in the `email-service.ts` file constants.

## TypeScript Support

Full TypeScript support with proper types:

```typescript
import type { 
  MatchDetails, 
  EmailRecipient, 
  VerificationEmailOptions 
} from '@/lib/email/types';
```

## Best Practices

1. **Always handle errors** when sending emails
2. **Use appropriate email types** for different scenarios
3. **Include user names** for personalization when available
4. **Test emails** in different email clients
5. **Monitor delivery rates** and bounce rates
6. **Use retry logic** for critical emails
7. **Keep email content concise** and action-oriented

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `RESEND_API_KEY` is set in your environment variables
   - Verify the API key is valid and active

2. **Email Not Delivered**
   - Check spam folders
   - Verify the recipient email address
   - Check Resend dashboard for delivery status

3. **Template Issues**
   - Test emails with different email clients
   - Validate HTML structure
   - Check for proper escaping of special characters

### Environment Variables

Make sure these are set in your `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_SITE_URL=https://fantasyproclubs.com
```

## Support

For issues with the email service:
1. Check the console for error messages
2. Verify your Resend API key and configuration
3. Test with a simple email first
4. Check the examples in `examples.ts` for proper usage

---

Built for Fantasy Pro Clubs with ❤️ using Resend API. 