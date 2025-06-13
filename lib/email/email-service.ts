import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = 'Fantasy Pro Clubs';
const FROM_EMAIL = 'Fantasy Pro Clubs <noreply@fantasyproclubs.com>';
const WEBSITE_URL = 'https://fantasyproclubs.com';

// Base email template with consistent styling
const createEmailTemplate = (content: string, title: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0D0D0D; color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">⚽ ${APP_NAME}</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Professional Football Club Management</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px; background-color: #111111;">
      <h2 style="color: #FACC15; margin: 0 0 20px 0; font-size: 24px;">${title}</h2>
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="padding: 24px; background-color: #0A0A0A; text-align: center; border-top: 1px solid #333;">
      <p style="margin: 0; font-size: 14px; color: #888;">
        © 2024 ${APP_NAME}. All rights reserved.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
        This email was sent to you as part of your ${APP_NAME} account activity.
      </p>
    </div>
  </div>
`;

// Button component for emails
const createButton = (url: string, text: string, color = '#FACC15') => `
  <a href="${url}" 
     style="display: inline-block; margin: 20px 0; padding: 14px 28px; background-color: ${color}; color: #0D0D0D; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; text-align: center;">
    ${text}
  </a>
`;

// Email Templates
export const EmailTemplates = {
  // Email Verification
  verification: ({ userName, verifyUrl }: { userName?: string; verifyUrl: string }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${userName ? `Hi ${userName},` : 'Welcome!'} 👋
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thank you for joining ${APP_NAME}! To complete your registration and activate your account, please verify your email address.
      </p>
      ${createButton(verifyUrl, '✅ Verify Email Address')}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        If you didn't create an account with us, please ignore this email. The verification link will expire in 24 hours.
      </p>
    `;
    return createEmailTemplate(content, 'Welcome to Fantasy Pro Clubs! 🎉');
  },

  // Password Reset
  passwordReset: ({ userName, resetUrl }: { userName?: string; resetUrl: string }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${userName ? `Hi ${userName},` : 'Hello,'}
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password for your ${APP_NAME} account. Click the button below to create a new password:
      </p>
      ${createButton(resetUrl, '🔒 Reset Password')}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        If you didn't request a password reset, please ignore this email. This link will expire in 1 hour for security reasons.
      </p>
      <p style="font-size: 14px; color: #aaa; margin-top: 12px;">
        For your security, never share this link with anyone.
      </p>
    `;
    return createEmailTemplate(content, 'Password Reset Request 🔐');
  },

  // Welcome Email (after verification)
  welcome: ({ userName, dashboardUrl }: { userName: string; dashboardUrl: string }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName}! 🎉
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your email has been verified and your ${APP_NAME} account is now active! You're ready to start your football management journey.
      </p>
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
        <h3 style="color: #10B981; margin: 0 0 12px 0;">Getting Started:</h3>
        <ul style="color: #ccc; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Complete your profile setup</li>
          <li>Join or create a football club</li>
          <li>Build your fantasy team</li>
          <li>Connect with other players</li>
        </ul>
      </div>
      ${createButton(dashboardUrl, '🚀 Go to Dashboard', '#10B981')}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        Need help getting started? Visit our <a href="${WEBSITE_URL}/help" style="color: #10B981;">Help Center</a> or contact our support team.
      </p>
    `;
    return createEmailTemplate(content, 'Welcome to Fantasy Pro Clubs! ⚽');
  },

  // Match Notification
  matchNotification: ({ 
    userName, 
    matchDetails, 
    matchUrl 
  }: { 
    userName: string; 
    matchDetails: {
      homeTeam: string;
      awayTeam: string;
      date: string;
      time: string;
      competition: string;
    };
    matchUrl: string;
  }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName}! ⚽
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        You have an upcoming match in ${matchDetails.competition}:
      </p>
      <div style="background-color: #1a1a1a; padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #FACC15;">
        <h3 style="color: #FACC15; margin: 0 0 16px 0; font-size: 20px;">
          ${matchDetails.homeTeam} vs ${matchDetails.awayTeam}
        </h3>
        <p style="color: #ccc; margin: 8px 0; font-size: 16px;">
          📅 ${matchDetails.date} at ${matchDetails.time}
        </p>
        <p style="color: #10B981; margin: 8px 0; font-weight: bold;">
          🏆 ${matchDetails.competition}
        </p>
      </div>
      ${createButton(matchUrl, '📱 View Match Details')}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        Make sure you're ready and available for the match. Good luck! 🍀
      </p>
    `;
    return createEmailTemplate(content, 'Upcoming Match Reminder ⚽');
  },

  // Team Invitation
  teamInvitation: ({ 
    userName, 
    teamName, 
    inviterName, 
    acceptUrl 
  }: { 
    userName: string; 
    teamName: string; 
    inviterName: string; 
    acceptUrl: string;
  }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName}! 🎯
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        You've been invited to join <strong style="color: #FACC15;">${teamName}</strong> by ${inviterName}!
      </p>
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
        <h3 style="color: #10B981; margin: 0 0 12px 0;">Team: ${teamName}</h3>
        <p style="color: #ccc; margin: 0;">Invited by: ${inviterName}</p>
      </div>
      ${createButton(acceptUrl, '✅ Accept Invitation', '#10B981')}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        This invitation will expire in 7 days. If you're not interested, you can safely ignore this email.
      </p>
    `;
    return createEmailTemplate(content, 'Team Invitation 🏆');
  },

  // Generic Notification
  notification: ({ 
    userName, 
    title, 
    message, 
    actionUrl, 
    actionText 
  }: { 
    userName: string; 
    title: string; 
    message: string; 
    actionUrl?: string; 
    actionText?: string;
  }) => {
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName}! 📢
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${message}
      </p>
      ${actionUrl && actionText ? createButton(actionUrl, actionText) : ''}
      <p style="font-size: 14px; color: #aaa; margin-top: 24px;">
        This is an automated notification from ${APP_NAME}.
      </p>
    `;
    return createEmailTemplate(content, title);
  }
};

// Main Email Service
export class EmailService {
  // Send verification email
  static async sendVerificationEmail({
    to,
    userName,
    token,
  }: {
    to: string;
    userName?: string;
    token: string;
  }) {
    const verifyUrl = `${WEBSITE_URL}/verify?token=${token}`;
    const html = EmailTemplates.verification({ userName, verifyUrl });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Verify Your Email - ${APP_NAME}`,
      html,
    });
  }

  // Send password reset email
  static async sendPasswordResetEmail({
    to,
    userName,
    token,
  }: {
    to: string;
    userName?: string;
    token: string;
  }) {
    const resetUrl = `${WEBSITE_URL}/reset-password?token=${token}`;
    const html = EmailTemplates.passwordReset({ userName, resetUrl });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Password Reset - ${APP_NAME}`,
      html,
    });
  }

  // Send welcome email
  static async sendWelcomeEmail({
    to,
    userName,
  }: {
    to: string;
    userName: string;
  }) {
    const dashboardUrl = `${WEBSITE_URL}/dashboard`;
    const html = EmailTemplates.welcome({ userName, dashboardUrl });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${APP_NAME}! 🎉`,
      html,
    });
  }

  // Send match notification
  static async sendMatchNotification({
    to,
    userName,
    matchDetails,
    matchId,
  }: {
    to: string;
    userName: string;
    matchDetails: {
      homeTeam: string;
      awayTeam: string;
      date: string;
      time: string;
      competition: string;
    };
    matchId: string;
  }) {
    const matchUrl = `${WEBSITE_URL}/matches/${matchId}`;
    const html = EmailTemplates.matchNotification({ userName, matchDetails, matchUrl });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Match Reminder: ${matchDetails.homeTeam} vs ${matchDetails.awayTeam}`,
      html,
    });
  }

  // Send team invitation
  static async sendTeamInvitation({
    to,
    userName,
    teamName,
    inviterName,
    invitationId,
  }: {
    to: string;
    userName: string;
    teamName: string;
    inviterName: string;
    invitationId: string;
  }) {
    const acceptUrl = `${WEBSITE_URL}/invitations/${invitationId}`;
    const html = EmailTemplates.teamInvitation({ userName, teamName, inviterName, acceptUrl });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Team Invitation: ${teamName}`,
      html,
    });
  }

  // Send generic notification
  static async sendNotification({
    to,
    userName,
    title,
    message,
    actionUrl,
    actionText,
  }: {
    to: string;
    userName: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    const html = EmailTemplates.notification({ userName, title, message, actionUrl, actionText });

    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: title,
      html,
    });
  }

  // Bulk email sender (for newsletters, announcements)
  static async sendBulkEmail({
    recipients,
    subject,
    title,
    message,
    actionUrl,
    actionText,
  }: {
    recipients: Array<{ email: string; name: string }>;
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    const promises = recipients.map(({ email, name }) => {
      const html = EmailTemplates.notification({ 
        userName: name, 
        title, 
        message, 
        actionUrl, 
        actionText 
      });

      return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
      });
    });

    return await Promise.allSettled(promises);
  }
}

export default EmailService; 