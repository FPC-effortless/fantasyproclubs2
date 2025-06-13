// Email-related TypeScript types

export interface MatchDetails {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  competition: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface EmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

export type EmailType = 
  | 'verification'
  | 'password-reset'
  | 'welcome'
  | 'match-notification'
  | 'team-invitation'
  | 'notification'
  | 'bulk';

export interface BaseEmailOptions {
  to: string;
  userName?: string;
}

export interface VerificationEmailOptions extends BaseEmailOptions {
  token: string;
}

export interface PasswordResetEmailOptions extends BaseEmailOptions {
  token: string;
}

export interface WelcomeEmailOptions extends BaseEmailOptions {
  userName: string;
}

export interface MatchNotificationOptions extends BaseEmailOptions {
  userName: string;
  matchDetails: MatchDetails;
  matchId: string;
}

export interface TeamInvitationOptions extends BaseEmailOptions {
  userName: string;
  teamName: string;
  inviterName: string;
  invitationId: string;
}

export interface NotificationOptions extends BaseEmailOptions {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export interface BulkEmailOptions {
  recipients: EmailRecipient[];
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
} 