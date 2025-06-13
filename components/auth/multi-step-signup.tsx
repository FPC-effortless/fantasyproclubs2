"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, EyeOff, UserPlus, Check, X, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { validatePassword } from '@/lib/utils/password-strength'
import { useAuth } from '@/lib/auth-context'
import { TeamSelection } from './team-selection'
import { useSupabase } from '@/components/providers/supabase-provider'

const STEPS = [
  { id: 1, title: 'Create Account', description: 'Basic account information' },
  { id: 2, title: 'Choose Team', description: 'Select your favorite team' },
  { id: 3, title: 'Complete', description: 'Finish setup' }
]

export function MultiStepSignup() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { supabase } = useSupabase()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedTeamId: null as string | null,
  })
  
  const [validation, setValidation] = useState(validatePassword(''))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      setValidation(validatePassword(value))
    }
  }

  const handleTeamSelect = (teamId: string | null) => {
    setForm(prev => ({ ...prev, selectedTeamId: teamId }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAccountCreation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validation.isValid) {
      setError('Please fix the password requirements')
      setIsLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Use our custom signup API instead of Supabase auth directly
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          selectedTeamId: form.selectedTeamId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      if (data.success) {
        setUserId(data.userId);
        
        toast({
          title: "Account Created",
          description: data.emailSent 
            ? "Great! Now let's choose your favorite team." 
            : "Account created! You can request a verification email later.",
        })
        nextStep()
      } else {
        throw new Error(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      let errorMessage = 'Failed to create account. Please try again.'
      
      if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.'
      } else if (err.message?.includes('Password')) {
        errorMessage = 'Password does not meet requirements.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toast({
        title: "Signup Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamSelection = async () => {
    setIsLoading(true)
    
    try {
      // Update user profile with selected team (if any)
      if (form.selectedTeamId && userId) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ team_id: form.selectedTeamId })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating team preference:', updateError)
          // Don't fail the signup for this, just log it
        }
      }

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully. Please check your email to confirm your account.",
      })
      
      nextStep()
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`)
      }, 2000)
      
    } catch (err: any) {
      console.error('Error saving team preference:', err)
      toast({
        title: "Team Selection Error",
        description: "Your account was created but we couldn't save your team preference. You can update this later in your profile.",
        variant: "destructive",
      })
      
      // Still redirect to verification
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`)
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6" style={{backgroundColor: '#111827'}}>
      {/* Back Button - Top Left */}
      {currentStep > 1 && (
        <button 
          onClick={prevStep}
          className="absolute top-6 left-6 p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
          title="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Content Container */}
      <div className="w-full max-w-md">
        {/* Step 1: Account Creation */}
        {currentStep === 1 && (
          <>
            {/* Icon and Header */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Create Account</h1>
              <p className="text-gray-400 text-lg">Join thousands of players in the<br/>ultimate football experience</p>
            </div>

            <form onSubmit={handleAccountCreation} className="space-y-6">
              {error && (
                <div className="text-sm text-red-400 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name Field */}
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-gray-600 rounded-none focus:outline-none focus:border-green-500 transition-all text-white placeholder-gray-400 text-lg"
                  style={{backgroundColor: 'transparent', background: 'none', boxShadow: 'none'}}
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />

                {/* Email Field */}
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-gray-600 rounded-none focus:outline-none focus:border-green-500 transition-all text-white placeholder-gray-400 text-lg"
                  style={{backgroundColor: 'transparent', background: 'none', boxShadow: 'none'}}
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />

                {/* Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-0 py-4 pr-12 bg-transparent border-0 border-b border-gray-600 rounded-none focus:outline-none focus:border-green-500 transition-all text-white placeholder-gray-400 text-lg"
                    style={{backgroundColor: 'transparent', background: 'none', boxShadow: 'none'}}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-0 py-4 pr-12 bg-transparent border-0 border-b border-gray-600 rounded-none focus:outline-none focus:border-green-500 transition-all text-white placeholder-gray-400 text-lg"
                    style={{backgroundColor: 'transparent', background: 'none', boxShadow: 'none'}}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-400 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password validation messages */}
                {form.password && validation.errors.length > 0 && (
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm flex items-center gap-2">
                        <X className="h-3 w-3" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Password match indicator */}
                {form.confirmPassword && (
                  <p className={`text-sm flex items-center gap-2 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch ? 'Passwords match' : 'Passwords don\'t match'}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !validation.isValid || !passwordsMatch}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Team Selection */}
        {currentStep === 2 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/30">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>

            <TeamSelection
              selectedTeamId={form.selectedTeamId}
              onTeamSelect={handleTeamSelect}
              showSkipOption={true}
            />

            <div className="mt-8 space-y-3">
              <Button
                onClick={handleTeamSelection}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-900/30"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Completing Setup...</span>
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-900/30">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-green-100 mb-2">Welcome to EA FC Pro Clubs!</h2>
              <p className="text-gray-400">
                Your account has been created successfully. Please check your email to verify your account.
              </p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-xl">
              <p className="text-green-300 text-sm">
                📧 A verification email has been sent to{' '}
                <span className="font-medium">{form.email}</span>
              </p>
            </div>

            <div className="animate-pulse">
              <p className="text-gray-400 text-sm">Redirecting you to verify your email...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}