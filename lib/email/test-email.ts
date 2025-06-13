// Test file for email service - DO NOT COMMIT TO PRODUCTION
// This file is for testing purposes only

import { EmailService } from './email-service';

// Test function - uncomment and run to test email service
export const testEmailService = async () => {
  console.log('Testing Email Service...');
  
  // Make sure to set RESEND_API_KEY in your environment
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }

  try {
    // Test verification email
    console.log('📧 Testing verification email...');
    const result = await EmailService.sendVerificationEmail({
      to: 'test@example.com', // Replace with your test email
      userName: 'Test User',
      token: 'test_token_123'
    });
    
    console.log('✅ Verification email sent successfully:', result);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
  }

  try {
    // Test welcome email
    console.log('📧 Testing welcome email...');
    const result = await EmailService.sendWelcomeEmail({
      to: 'test@example.com', // Replace with your test email
      userName: 'Test User'
    });
    
    console.log('✅ Welcome email sent successfully:', result);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }

  try {
    // Test notification email
    console.log('📧 Testing notification email...');
    const result = await EmailService.sendNotification({
      to: 'test@example.com', // Replace with your test email
      userName: 'Test User',
      title: 'Test Notification',
      message: 'This is a test notification from Fantasy Pro Clubs!',
      actionUrl: 'https://fantasyproclubs.com',
      actionText: 'Visit Site'
    });
    
    console.log('✅ Notification email sent successfully:', result);
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
  }
};

// Uncomment the line below to run tests (make sure to set your test email above)
// testEmailService(); 