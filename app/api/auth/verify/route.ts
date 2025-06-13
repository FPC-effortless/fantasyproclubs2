import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { EmailService } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Find the verification token
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user profile to mark email as verified
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Update auth user metadata if possible
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { email_verified: true }
      });
      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }
    } catch (authError) {
      console.error('Error updating auth metadata:', authError);
    }

    // Delete the verification token
    const { error: deleteError } = await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    if (deleteError) {
      console.error('Error deleting verification token:', deleteError);
      // Don't fail the verification for this
    }

    // Get user profile for welcome email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', tokenData.user_id)
      .single();

    // Send welcome email
    if (userProfile) {
      try {
        await EmailService.sendWelcomeEmail({
          to: userProfile.email,
          userName: userProfile.full_name || userProfile.email.split('@')[0]
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail verification if welcome email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to Fantasy Pro Clubs!'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for verification links
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=missing-token', request.url));
  }

  // Use the POST handler for the actual verification
  const verificationResponse = await POST(new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ token })
  }));

  const result = await verificationResponse.json();

  if (result.success) {
    return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url));
  } else {
    return NextResponse.redirect(new URL(`/auth/verify-email?error=${encodeURIComponent(result.error)}`, request.url));
  }
} 