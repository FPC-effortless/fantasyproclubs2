'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Shield, Search } from 'lucide-react'
import Image from 'next/image'
import styles from './select-team.module.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface Team {
  id: string
  name: string
  logo_url: string
  primary_color: string
  secondary_color: string
}

export default function SelectTeamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  const checkSignupFlow = useCallback(async () => {
    const tempUserId = searchParams.get('userId')
    const role = searchParams.get('role')
    
    if (!tempUserId || !role) {
      toast({
        title: "Invalid Access",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Attempt session verification but allow continuation anonymously
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== tempUserId) {
        console.warn('Session user mismatch, continuing')
      }
    } catch (err) {
      console.warn('No active session in team selection')
    }
  }, [router, searchParams, supabase])

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/public/teams')
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Fetch failed')

      setTeams(json.data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to load teams. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    checkSignupFlow()
    fetchTeams()
  }, [checkSignupFlow, fetchTeams])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTeamSelection = async () => {
    if (!selectedTeam) {
      toast({
        title: "Please Select a Team",
        description: "Choose your favorite team to support.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    try {
      // Upsert favorite team into user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, favorite_team_id: selectedTeam }, { onConflict: 'user_id' })

      if (error) {
        console.warn('Upsert favorite team error:', error)
      }

      // If user is a player or manager, navigate to gaming ID setup
      if (role === 'player' || role === 'manager') {
        router.push(`/auth/gaming-setup?userId=${userId}&role=${role}`)
      } else {
        // For fans, complete the signup process
        toast({
          title: "Welcome to Fantasy Pro Clubs!",
          description: "Your account has been created successfully.",
        })
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Error updating favorite team:', error)
      toast({
        title: "Error",
        description: "Failed to save your team selection. Please try again.",
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
        <div className="w-full max-w-6xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                Choose Your Team
              </h1>
              <p className="mt-3 text-gray-400 text-lg">
                Select your favorite team to support in Fantasy Pro Clubs
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeam === team.id
              
              return (
                <Card
                  key={team.id}
                  className={`
                    bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg 
                    border-2 transition-all duration-300 cursor-pointer group
                    ${isSelected 
                      ? 'border-green-500 shadow-2xl shadow-green-500/20 scale-105' 
                      : 'border-gray-700/30 hover:border-gray-600/50 hover:scale-102'
                    }
                  `}
                  onClick={() => setSelectedTeam(team.id)}
                >
                  <div className="p-4 space-y-3">
                    {/* Team Logo */}
                    <div className="relative w-full aspect-square">
                      <div 
                        className={`
                          absolute inset-0 rounded-lg overflow-hidden
                          ${isSelected ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900' : ''}
                        `}
                      >
                        {team.logo_url ? (
                          <Image
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div 
                            className={styles.teamLogo}
                            style={{ 
                              '--team-primary-color': team.primary_color || '#004225',
                              '--team-secondary-color': team.secondary_color || '#ffffff20'
                            } as React.CSSProperties}
                          >
                            <Shield className="w-12 h-12 text-white/80" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Name */}
                    <h3 className={`
                      text-center font-semibold text-sm
                      ${isSelected ? 'text-green-400' : 'text-gray-200 group-hover:text-white'}
                    `}>
                      {team.name}
                    </h3>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
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
              onClick={handleTeamSelection}
              disabled={!selectedTeam || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 