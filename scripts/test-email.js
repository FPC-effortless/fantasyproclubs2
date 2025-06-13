const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n📧 Fantasy Pro Clubs - Email Test\n');

// Check if API key is configured
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_resend_api_key_here') {
  console.log('❌ Resend API key not configured!');
  console.log('Please run: npm run setup:resend\n');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

rl.question('Enter email address to send test email to: ', async (email) => {
  if (!email || !email.includes('@')) {
    console.log('\n❌ Invalid email address\n');
    rl.close();
    return;
  }

  console.log('\n📤 Sending test email...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Fantasy Pro Clubs <onboarding@resend.dev>',
      to: email,
      subject: 'Test Email - Fantasy Pro Clubs',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white;">⚽ Fantasy Pro Clubs</h1>
          </div>
          <div style="padding: 32px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Test Email Successful! 🎉</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test email from your Fantasy Pro Clubs application.
              If you're seeing this, your email configuration is working correctly!
            </p>
            <div style="background-color: #e8f5e9; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #2e7d32; margin: 0;">
                <strong>✅ Email service is configured correctly</strong><br>
                You can now use email features in your app.
              </p>
            </div>
            <p style="color: #666;">
              Next steps:
            </p>
            <ul style="color: #666;">
              <li>Configure Supabase SMTP settings</li>
              <li>Test user registration flow</li>
              <li>Customize email templates</li>
            </ul>
          </div>
          <div style="padding: 24px; background-color: #333; text-align: center; color: #999; font-size: 14px;">
            © 2024 Fantasy Pro Clubs. All rights reserved.
          </div>
        </div>
      `
    });

    if (error) {
      console.log('❌ Failed to send email:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Check your Resend API key in .env.local');
      console.log('2. Verify your Resend account is active');
      console.log('3. Check if you have sending limits\n');
    } else {
      console.log('✅ Test email sent successfully!');
      console.log(`📬 Check ${email} for the test email`);
      console.log('\nEmail ID:', data?.id);
      console.log('\nYour email service is working! You can now:');
      console.log('- Configure Supabase SMTP settings');
      console.log('- Test the signup flow');
      console.log('- Send verification emails\n');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Your Resend API key is valid');
    console.log('2. You have internet connection');
    console.log('3. The resend package is installed\n');
  }

  rl.close();
}); 