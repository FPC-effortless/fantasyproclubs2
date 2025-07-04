import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  console.log('Auth confirm - received params:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (error) {
        console.error('Auth confirm - OTP verification error:', error)
        redirect(`/auth/callback?error=${encodeURIComponent(error.message)}`)
      }

      if (data?.user) {
        console.log('Auth confirm - user verified successfully:', data.user.id)
        
        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: createProfileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                username: data.user.email?.split('@')[0] || 'user',
                user_type: 'fan',
                status: 'active',
                platform_verified: false,
                show_gaming_tags: true,
                show_platform: true,
                allow_team_invites: true,
                xbox_verified: false,
                psn_verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])

          if (createProfileError) {
            console.error('Error creating user profile:', createProfileError)
            // Don't fail the confirmation, profile can be created later
          }
        }

        // Redirect to callback with success
        redirect(`/auth/callback?success=true&message=${encodeURIComponent('Email verified successfully')}`)
      }
    } catch (error: any) {
      console.error('Auth confirm - unexpected error:', error)
      redirect(`/auth/callback?error=${encodeURIComponent(error.message || 'Verification failed')}`)
    }
  }

  // If no token_hash or type, redirect to error
  console.error('Auth confirm - missing required parameters')
  redirect('/auth/callback?error=' + encodeURIComponent('Invalid verification link'))
} 