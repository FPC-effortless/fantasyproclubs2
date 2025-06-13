const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Fantasy Pro Clubs - Resend Email Setup\n');
console.log('This script will help you set up email functionality using Resend.\n');

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.local.example');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...\n');
  
  // Create from example if it exists
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  } else {
    // Create a new one with default values
    const defaultEnv = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fantasy Pro Clubs

# Email Configuration
EMAIL_FROM=Fantasy Pro Clubs <noreply@fantasyproclubs.com>
`;
    fs.writeFileSync(envPath, defaultEnv);
  }
}

console.log('📋 Setup Steps:\n');
console.log('1. Sign up for Resend at https://resend.com (Free: 3,000 emails/month)');
console.log('2. Go to Dashboard > API Keys');
console.log('3. Create a new API key');
console.log('4. Copy the API key (starts with "re_")\n');

rl.question('Enter your Resend API key (or press Enter to skip): ', (apiKey) => {
  if (apiKey && apiKey.startsWith('re_')) {
    // Read current env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the API key
    envContent = envContent.replace(
      /RESEND_API_KEY=.*/,
      `RESEND_API_KEY=${apiKey}`
    );
    
    // Write back
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Resend API key saved to .env.local\n');
    
    console.log('📧 Next Steps:\n');
    console.log('1. Configure Supabase SMTP settings:');
    console.log('   - Go to your Supabase dashboard');
    console.log('   - Navigate to Authentication > Settings > SMTP Settings');
    console.log('   - Use these settings:');
    console.log('     • SMTP Host: smtp.resend.com');
    console.log('     • SMTP Port: 587');
    console.log('     • SMTP User: resend');
    console.log(`     • SMTP Password: ${apiKey}`);
    console.log('     • Sender Email: noreply@yourdomain.com');
    console.log('     • Sender Name: Fantasy Pro Clubs\n');
    
    console.log('2. Test your setup:');
    console.log('   npm run test:email\n');
    
    console.log('3. For production, update:');
    console.log('   - NEXT_PUBLIC_SITE_URL to your production URL');
    console.log('   - EMAIL_FROM to use your domain\n');
  } else if (apiKey) {
    console.log('\n❌ Invalid API key. Resend API keys start with "re_"\n');
  } else {
    console.log('\n⏭️  Skipped API key setup. You can add it later to .env.local\n');
  }
  
  console.log('📚 For more information, see RESEND_SETUP_GUIDE.md\n');
  rl.close();
}); 