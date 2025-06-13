#!/usr/bin/env node

/**
 * Email Verification Test Script
 * 
 * This script helps you test your email verification system
 * Run with: node scripts/test-email-verification.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmailVerification() {
  console.log('🚀 Testing Email Verification System\n')

  // Generate a test email
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  console.log(`📧 Test Email: ${testEmail}`)
  console.log(`🔑 Test Password: ${testPassword}\n`)

  try {
    // Test 1: Sign up a new user
    console.log('1️⃣ Testing user signup...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message)
      return
    }

    if (signUpData.user && !signUpData.user.email_confirmed_at) {
      console.log('✅ User created successfully!')
      console.log('📬 Confirmation email should be sent')
      console.log(`👤 User ID: ${signUpData.user.id}`)
      console.log(`📧 Email: ${signUpData.user.email}`)
      console.log(`🔄 Email Confirmed: ${signUpData.user.email_confirmed_at ? 'Yes' : 'No'}\n`)
    } else {
      console.log('⚠️ User might already exist or email is already confirmed\n')
    }

    // Test 2: Check if we can resend the confirmation email
    console.log('2️⃣ Testing email resend...')
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (resendError) {
      console.error('❌ Email resend failed:', resendError.message)
    } else {
      console.log('✅ Email resend successful!\n')
    }

    // Test 3: Check email configuration
    console.log('3️⃣ Checking email configuration...')
    
    // Try to get current auth settings (this might not work with client-side SDK)
    console.log('📋 Email Configuration:')
    console.log(`   - Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`)
    console.log(`   - Callback URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`)
    console.log('   - SMTP: Check your Supabase dashboard for SMTP configuration\n')

    // Test 4: Cleanup (optional)
    console.log('4️⃣ Cleanup...')
    console.log('⚠️ Note: Test user will remain in your auth system')
    console.log('   You can delete it manually from Supabase dashboard if needed\n')

    console.log('🎉 Email verification test completed!')
    console.log('\n📝 Next Steps:')
    console.log('1. Check your email logs in Supabase dashboard')
    console.log('2. If using custom SMTP, check your email provider logs')
    console.log('3. Test with a real email address to receive the verification email')
    console.log('4. Verify the email templates look correct')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testEmailVerification() 