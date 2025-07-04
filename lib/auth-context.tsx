"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type User, type Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  requestUpgrade: (reason: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Use the singleton client
  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Check user type and redirect if necessary
      if (session?.user) {
        try {
          const { data: profile, error: profileError, status } = await supabase
            .from('user_profiles')
            .select('user_type')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (profileError && status !== 406) {
            throw profileError
          }

          // Check for redirect param
          const redirectTo = searchParams.get('redirect')
          if (redirectTo) {
            router.push(redirectTo)
            return
          }

          if (profile?.user_type === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
        } catch (error) {
          console.error('Error checking user type:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, searchParams])

  const signIn = async (email: string, password: string) => {
    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      // Check user type and redirect
      if (user) {
        const { data: profile, error: profileError, status } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError && status !== 406) {
          throw profileError
        }

        // Check for redirect param
        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          router.push(redirectTo)
          return
        }

        if (profile?.user_type === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    
    // Note: User profile will be created by database trigger after email confirmation
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const requestUpgrade = async (reason: string) => {
    if (!user) throw new Error('Must be logged in to request upgrade')
    const { error } = await supabase
      .from('account_upgrade_requests')
      .insert([{ user_id: user.id, reason, status: 'pending' }])
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    requestUpgrade
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 