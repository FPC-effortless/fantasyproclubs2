'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      toast({
        title: "Email Sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error('Password reset request error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
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
                  <p className="text-gray-400">We&apos;ve sent password reset instructions to:</p>
                  <p className="text-green-100 font-medium mt-2">{email}</p>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-xl mb-6">
                  <p className="text-blue-100 text-sm">
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Button
                    onClick={() => setEmailSent(false)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/30"
                  >
                    Try Another Email
                  </Button>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full py-3 px-4 text-sm font-medium text-gray-300 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all backdrop-blur-sm group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
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
                <h2 className="text-2xl font-bold text-green-100 mb-2">Forgot Password?</h2>
                <p className="text-gray-400">Enter your email and we&apos;ll send you reset instructions</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-400"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 text-sm font-medium text-gray-300 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all backdrop-blur-sm group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>

                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-gray-400 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/login"
                      className="text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 