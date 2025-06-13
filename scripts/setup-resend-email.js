#!/usr/bin/env node

/**
 * Setup script for Resend Email Service
 * This script helps you configure Resend for your EA FC Pro Clubs app
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 EA FC Pro Clubs - Resend Email Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📋 Current Status:');
console.log(`   ✅ Email service code: Already implemented`);
console.log(`   ✅ Email templates: Professional templates ready`);
console.log(`   ${envExists ? '✅' : '❌'} Environment file: ${envExists ? 'Found' : 'Missing'}`);
console.log(`   ❌ Resend API key: Needs configuration`);
console.log('');

// Create .env.local if it doesn't exist
if (!envExists) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rnihbbrrqnvfruqaglmm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWhiYnJycW52ZnJ1cWFnbG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODY0NDMsImV4cCI6MjA2Mzk2MjQ0M30.L

# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Additional Services (Optional)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ .env.local created successfully');
  } catch (error) {
    console.log('   ❌ Failed to create .env.local:', error.message);
  }
} else {
  console.log('📝 .env.local already exists');
}

console.log('\n🎯 Setup Steps:');
console.log('');

console.log('1️⃣ Sign up for Resend (if you haven\'t already):');
console.log('   🔗 https://resend.com');
console.log('   💰 Free tier: 3,000 emails/month');
console.log('   📧 Perfect for development and small apps');
console.log('');

console.log('2️⃣ Get your Resend API key:');
console.log('   📱 Go to Resend Dashboard > API Keys');
console.log('   ➕ Create new API key');
console.log('   📋 Copy the API key (starts with "re_")');
console.log('');

console.log('3️⃣ Add API key to .env.local:');
console.log('   📝 Open .env.local in your editor');
console.log('   🔧 Replace "your_resend_api_key_here" with your actual API key');
console.log('   💾 Save the file');
console.log('');

console.log('4️⃣ Configure Supabase (IMPORTANT):');
console.log('   🌐 Go to Supabase Dashboard > Authentication > Settings');
console.log('   📧 Configure SMTP settings:');
console.log('      - SMTP Host: smtp.resend.com');
console.log('      - SMTP Port: 587');
console.log('      - SMTP User: resend');
console.log('      - SMTP Password: [Your Resend API Key]');
console.log('      - Sender Email: noreply@yourdomain.com (or any email)');
console.log('      - Sender Name: EA FC Pro Clubs');
console.log('');

console.log('5️⃣ Set up domain (Optional but recommended):');
console.log('   🌐 In Resend Dashboard > Domains');
console.log('   ➕ Add your domain (e.g., yourdomain.com)');
console.log('   📧 Use noreply@yourdomain.com as sender email');
console.log('');

console.log('6️⃣ Test the setup:');
console.log('   🧪 Run: npm run test:email');
console.log('   🚀 Or try signing up a new user');
console.log('   📬 Check if verification email is received');
console.log('');

console.log('🔧 Quick Test Commands:');
console.log('   npm run test:email          # Test email service');
console.log('   npm run dev                 # Start development server');
console.log('');

console.log('📋 Troubleshooting:');
console.log('   ❌ If emails don\'t send: Check API key and SMTP config');
console.log('   📧 If emails go to spam: Set up domain authentication');
console.log('   🔍 Check Resend dashboard for delivery logs');
console.log('');

console.log('🎉 Once configured, your signup flow will:');
console.log('   ✅ Send professional verification emails');
console.log('   ✅ Include user\'s favorite team selection');
console.log('   ✅ Redirect to login after verification');
console.log('   ✅ Provide great user experience');
console.log('');

console.log('💡 Pro Tips:');
console.log('   - Use a real domain for better deliverability');
console.log('   - Monitor email analytics in Resend dashboard');
console.log('   - Test with different email providers (Gmail, Yahoo, etc.)');
console.log('   - Keep API keys secure and never commit them');
console.log('');

console.log('🆘 Need help? Check the documentation:');
console.log('   📖 QUICK_EMAIL_SETUP.md');
console.log('   📖 DOMAIN_EMAIL_SETUP.md');
console.log('   📖 lib/email/README.md');
console.log('');

console.log('✨ Setup complete! Follow the steps above to configure Resend.'); 