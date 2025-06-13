import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { EmailService } from '@/lib/email/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, selectedTeamId } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Create user with email confirmation disabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          full_name: fullName,
          email_confirm: false // We'll handle email confirmation manually
        }
      }
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store verification token in database
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: authData.user.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
        email: email
      });

    if (tokenError) {
      console.error('Error storing verification token:', tokenError);
      // If we can't store the token, still continue but log the error
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        team_id: selectedTeamId,
        email_verified: false,
        user_type: 'fan'
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Continue even if profile creation fails - can be created later
    }

    // Send verification email using our email service
    let emailSent = false;
    try {
      // Only try to send email if RESEND_API_KEY is configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        await EmailService.sendVerificationEmail({
          to: email,
          userName: fullName || email.split('@')[0],
          token: verificationToken
        });
        emailSent = true;
      } else {
        console.log('RESEND_API_KEY not configured, skipping email sending');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue without failing the signup
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Account created successfully! Please check your email to verify your account.'
        : 'Account created successfully! Email service not configured yet - you can set up verification later.',
      userId: authData.user.id,
      emailSent: emailSent
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 