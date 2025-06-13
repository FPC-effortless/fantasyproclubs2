import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    let emailData: any = {
      from: process.env.EMAIL_FROM || 'Fantasy Pro Clubs <noreply@fantasyproclubs.com>',
      to,
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    switch (type) {
      case 'verification':
        emailData.subject = 'Verify your email - Fantasy Pro Clubs'
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Fantasy Pro Clubs!</h2>
            <p>Hi ${data.userName || 'there'},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${siteUrl}/auth/verify-email?token=${data.token}" 
               style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email
            </a>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `
        break

      case 'password-reset':
        emailData.subject = 'Reset your password - Fantasy Pro Clubs'
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${data.userName || 'there'},</p>
            <p>You requested to reset your password. Click the link below to create a new password:</p>
            <a href="${siteUrl}/auth/reset-password?token=${data.token}" 
               style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
        `
        break

      case 'welcome':
        emailData.subject = 'Welcome to Fantasy Pro Clubs!'
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Fantasy Pro Clubs!</h2>
            <p>Hi ${data.userName},</p>
            <p>Your email has been verified and your account is now active!</p>
            <p>You can now:</p>
            <ul>
              <li>Create or join fantasy teams</li>
              <li>Participate in competitions</li>
              <li>Track your performance</li>
              <li>Connect with other players</li>
            </ul>
            <a href="${siteUrl}/dashboard" 
               style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Go to Dashboard
            </a>
            <p>Need help? Visit our <a href="${siteUrl}/help">Help Center</a>.</p>
          </div>
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    const result = await resend.emails.send(emailData)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 