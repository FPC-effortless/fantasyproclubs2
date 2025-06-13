// Usage examples for the Email Service

import { EmailService } from './email-service';

// Example 1: Send verification email after user signup
export const handleUserSignup = async (userEmail: string, userName: string, verificationToken: string) => {
  try {
    await EmailService.sendVerificationEmail({
      to: userEmail,
      userName,
      token: verificationToken,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

// Example 2: Send password reset email
export const handlePasswordReset = async (userEmail: string, userName: string, resetToken: string) => {
  try {
    await EmailService.sendPasswordResetEmail({
      to: userEmail,
      userName,
      token: resetToken,
    });
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};

// Example 3: Send welcome email after email verification
export const handleEmailVerification = async (userEmail: string, userName: string) => {
  try {
    await EmailService.sendWelcomeEmail({
      to: userEmail,
      userName,
    });
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// Example 4: Send match notification
export const handleMatchReminder = async (
  userEmail: string, 
  userName: string, 
  matchId: string
) => {
  try {
    await EmailService.sendMatchNotification({
      to: userEmail,
      userName,
      matchDetails: {
        homeTeam: 'Manchester City FC',
        awayTeam: 'Liverpool FC',
        date: 'March 15, 2024',
        time: '3:00 PM GMT',
        competition: 'Premier League',
      },
      matchId,
    });
    console.log('Match notification sent successfully');
  } catch (error) {
    console.error('Failed to send match notification:', error);
  }
};

// Example 5: Send team invitation
export const handleTeamInvitation = async (
  inviteeEmail: string,
  inviteeName: string,
  teamName: string,
  inviterName: string,
  invitationId: string
) => {
  try {
    await EmailService.sendTeamInvitation({
      to: inviteeEmail,
      userName: inviteeName,
      teamName,
      inviterName,
      invitationId,
    });
    console.log('Team invitation sent successfully');
  } catch (error) {
    console.error('Failed to send team invitation:', error);
  }
};

// Example 6: Send custom notification
export const handleCustomNotification = async (
  userEmail: string,
  userName: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
) => {
  try {
    await EmailService.sendNotification({
      to: userEmail,
      userName,
      title,
      message,
      actionUrl,
      actionText,
    });
    console.log('Custom notification sent successfully');
  } catch (error) {
    console.error('Failed to send custom notification:', error);
  }
};

// Example 7: Send bulk email (newsletter/announcement)
export const handleBulkAnnouncement = async (users: Array<{email: string, name: string}>) => {
  try {
    const results = await EmailService.sendBulkEmail({
      recipients: users,
      subject: 'New Season Starting Soon! 🚀',
      title: 'Season 2024 Launch Announcement',
      message: 'We\'re excited to announce that the new season is starting next week! Get ready to compete with the best players and clubs.',
      actionUrl: 'https://fantasyproclubs.com/season-2024',
      actionText: '🏆 View Season Details',
    });
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`Bulk email sent: ${successful} successful, ${failed} failed`);
  } catch (error) {
    console.error('Failed to send bulk email:', error);
  }
};

// Example 8: Integration with API routes
export const emailHandlers = {
  // POST /api/auth/signup
  sendVerificationEmail: async (req: any, res: any) => {
    const { email, name, token } = req.body;
    
    try {
      await EmailService.sendVerificationEmail({
        to: email,
        userName: name,
        token,
      });
      
      res.status(200).json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  },

  // POST /api/auth/forgot-password
  sendPasswordReset: async (req: any, res: any) => {
    const { email, name, token } = req.body;
    
    try {
      await EmailService.sendPasswordResetEmail({
        to: email,
        userName: name,
        token,
      });
      
      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  },

  // POST /api/notifications/match-reminder
  sendMatchReminder: async (req: any, res: any) => {
    const { email, userName, matchDetails, matchId } = req.body;
    
    try {
      await EmailService.sendMatchNotification({
        to: email,
        userName,
        matchDetails,
        matchId,
      });
      
      res.status(200).json({ success: true, message: 'Match reminder sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  },
};

// Example 9: Error handling with retry logic
export const sendEmailWithRetry = async (
  emailFunction: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await emailFunction();
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to send email after ${maxRetries} attempts`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

// Example usage with retry
export const sendVerificationWithRetry = async (
  email: string, 
  userName: string, 
  token: string
) => {
  return sendEmailWithRetry(() => 
    EmailService.sendVerificationEmail({ to: email, userName, token })
  );
}; 