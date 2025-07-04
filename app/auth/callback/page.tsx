'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface State {
  status: 'processing' | 'success' | 'error'
  message?: string
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<State>({ status: 'processing' })

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      try {
        // Handle both PKCE code flow and legacy access_token flow
        const code = searchParams.get('code')
        const nextUrl = '/login' // default fallback

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          const accessToken = searchParams.get('access_token')
          const refreshToken = searchParams.get('refresh_token')
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (error) throw error
          }
        }

        // Fetch authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Failed to retrieve user after verification.')

        // Create / update profile row
        const meta = user.user_metadata || {}
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            first_name: meta.first_name || null,
            last_name: meta.last_name || null,
            phone_number: meta.phone_number || null,
            date_of_birth: meta.date_of_birth || null,
          }, { onConflict: 'user_id' })
        if (upsertError) {
          console.warn('Profile upsert error:', upsertError)
        }

        setState({ status: 'success' })

        // Decide where to send them: if no role yet -> select-role, else dashboard
        // Fetch profile to see if user_type set
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single()

        const dest = profile?.user_type ? '/dashboard' : `/auth/select-role?userId=${user.id}`

        // Redirect after short delay so user sees success screen
        setTimeout(() => {
          router.push(dest)
        }, 2500)
      } catch (err: any) {
        console.error('Email verification callback error:', err)
        setState({ status: 'error', message: err.message || 'Something went wrong.' })
      }
    }

    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      {state.status === 'processing' && (
        <div className="flex flex-col items-center space-y-6">
          <Loader2 className="w-10 h-10 animate-spin text-green-400" />
          <p className="text-gray-300 text-lg">Verifying your account…</p>
        </div>
      )}

      {state.status === 'success' && (
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-100">Account Verified!</h1>
          <p className="text-gray-400">Redirecting you to the next step…</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-red-100">Verification Failed</h1>
          <p className="text-gray-400 max-w-sm text-center">{state.message}</p>
          <Button onClick={() => router.push('/login')}>Return to Login</Button>
        </div>
      )}
    </div>
  )
} 