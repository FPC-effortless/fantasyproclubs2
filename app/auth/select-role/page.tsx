'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Shield, Gamepad2, Heart, BarChart3 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'fan' | 'player' | 'manager'

interface RoleOption {
  id: UserRole
  title: string
  description: string
  icon: React.ElementType
  color: string
  features: string[]
}

const roleOptions: RoleOption[] = [
  {
    id: 'fan',
    title: 'Fantasy Football Fan',
    description: 'Create fantasy teams, join leagues, and compete with friends',
    icon: Heart,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Create and manage fantasy teams',
      'Join fantasy leagues',
      'Track player statistics',
      'Compete in tournaments'
    ]
  },
  {
    id: 'player',
    title: 'Pro Club Player',
    description: 'Track your performance, join teams, and showcase your skills',
    icon: Gamepad2,
    color: 'from-green-500 to-green-600',
    features: [
      'Professional player profile',
      'Performance analytics',
      'Team membership',
      'Match history tracking'
    ]
  },
  {
    id: 'manager',
    title: 'Team Manager',
    description: 'Lead your squad, manage tactics, and organize competitions',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    features: [
      'Team management tools',
      'Squad selection',
      'Match organization',
      'Analytics dashboard'
    ]
  }
]

export default function SelectRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const checkSignupFlow = useCallback(async () => {
    const tempUserId = searchParams.get('userId')
    if (!tempUserId) {
      toast({
        title: "Invalid Access",
        description: "Please complete the signup form first.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== tempUserId) {
        console.warn('Session user mismatch, continuing without auth session')
      }
    } catch (err) {
      console.warn('No active session, proceeding anonymously')
    }
  }, [router, searchParams, supabase])

  useEffect(() => {
    checkSignupFlow()
  }, [checkSignupFlow])

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({
        title: "Please Select a Role",
        description: "Choose how you want to use Fantasy Pro Clubs.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const userId = searchParams.get('userId')

    try {
      // Upsert user profile with selected role (insert if not exists)
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, user_type: selectedRole }, { onConflict: 'user_id' })

      if (error) {
        console.warn('Upsert role error, continuing flow:', error)
      }

      // Navigate to team selection
      router.push(`/auth/select-team?userId=${userId}&role=${selectedRole}`)
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to save your role selection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                Choose Your Path
              </h1>
              <p className="mt-3 text-gray-400 text-lg">
                Select how you want to experience Fantasy Pro Clubs
              </p>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {roleOptions.map((role) => {
              const IconComponent = role.icon
              const isSelected = selectedRole === role.id
              
              return (
                <Card
                  key={role.id}
                  className={`
                    bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg 
                    border-2 transition-all duration-300 cursor-pointer
                    ${isSelected 
                      ? 'border-green-500 shadow-2xl shadow-green-500/20 scale-105' 
                      : 'border-gray-700/30 hover:border-gray-600/50 hover:scale-102'
                    }
                  `}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="p-6 space-y-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-green-100 mb-2">{role.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{role.description}</p>
                    </div>

                    <div className="space-y-2">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color} mr-2`} />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue to Team Selection'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 