"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return false
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Sign up user with email confirmation enabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            date_of_birth: formData.dateOfBirth,
          }
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Try logging in instead.",
            variant: "destructive",
          })
        } else if (signUpError.message.includes('email')) {
          toast({
            title: "Email Service Issue",
            description: "There was an issue sending the verification email. Please try again or contact support.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Registration Failed",
            description: signUpError.message || "An error occurred during registration. Please try again.",
            variant: "destructive",
          })
        }
        return
      }

      if (authData.user) {
        // Redirect to role selection page with user ID
        router.push(`/auth/select-role?userId=${authData.user.id}`)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = "An error occurred during registration. Please try again."
      
      if (error.message) {
        if (error.message.includes('email')) {
          errorMessage = "Email verification service is currently unavailable. Please try again later."
        } else if (error.message.includes('password')) {
          errorMessage = "Password doesn't meet requirements. Please use at least 6 characters."
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again."
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black px-4 pb-24 pt-12 overflow-x-hidden">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-200">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500"
                  placeholder="John"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-200">Last Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-200">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="john@example.com"
              />
            </div>
          </div>
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-200">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-200">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              title="Select your date of birth"
              aria-label="Date of birth"
              className="h-11 bg-black/40 border-gray-800 text-white"
            />
          </div>
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-200">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500 pr-10"
                placeholder="Create a password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 h-11 bg-black/40 border-gray-800 text-white placeholder:text-gray-500 pr-10"
                placeholder="Confirm your password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-700 bg-black/40 text-green-500 focus:ring-green-500"
              title="Agree to terms and conditions"
              placeholder="Agree to terms and conditions"
            />
            <Label htmlFor="terms" className="text-sm text-gray-300">
              I agree to the{" "}
              <Link href="/terms" className="text-green-500 hover:text-green-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-500 hover:text-green-400">
                Privacy Policy
              </Link>
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
            disabled={isLoading || !agreedToTerms}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 
