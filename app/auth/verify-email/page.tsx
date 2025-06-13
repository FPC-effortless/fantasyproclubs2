'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, RefreshCw, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get email from URL params or user
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else if (user?.email) {
      setEmail(user.email)
    }
  }, [searchParams, user])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address found. Please sign up again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast({
        title: "Email Sent",
        description: "We've sent another verification email to your inbox.",
      })
      setResendCooldown(60) // 60 second cooldown
    } catch (error: any) {
      console.error('Resend email error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to resend email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/placeholder-bg.jpg')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700/30 shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/30">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-100 mb-2">Check Your Email</h2>
                <p className="text-gray-400">We&apos;ve sent a verification link to your email address</p>
              </div>

              {/* Email Display */}
              {email && (
                <div className="mb-8 p-4 bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span className="text-green-100 font-medium">{email}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-100 font-medium">Check your inbox</h3>
                      <p className="text-gray-400 text-sm">Look for an email from EA FC Pro Clubs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-100 font-medium">Click the verification link</h3>
                      <p className="text-gray-400 text-sm">This will confirm your email and activate your account</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-100 font-medium">Start playing</h3>
                      <p className="text-gray-400 text-sm">Once verified, you can access all features</p>
                    </div>
                  </div>
                </div>

                {/* Spam folder notice */}
                <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-700/30 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-100 text-sm font-medium">Can&apos;t find the email?</span>
                  </div>
                  <p className="text-yellow-200/80 text-sm mt-1">
                    Check your spam or junk folder. The email might take a few minutes to arrive.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {/* Resend Email Button */}
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : resendCooldown > 0 ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Resend in {resendCooldown}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Email</span>
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 text-gray-400">
                      or
                    </span>
                  </div>
                </div>

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 text-sm font-medium text-gray-300 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all backdrop-blur-sm group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>

                {/* Wrong Email */}
                <div className="text-center pt-2">
                  <p className="text-gray-400 text-sm">
                    Wrong email address?{' '}
                    <Link
                      href="/auth/signup"
                      className="text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                      Sign up again
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 