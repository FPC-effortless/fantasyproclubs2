"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Search, Users, Star, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'

interface Team {
  id: string
  name: string
  short_name: string
  logo_url: string | null
  description: string | null
  manager?: {
    id: string
    display_name: string | null
  } | null
}

interface TeamSelectionProps {
  selectedTeamId?: string | null
  onTeamSelect: (teamId: string | null) => void
  showSkipOption?: boolean
}

export function TeamSelection({ selectedTeamId, onTeamSelect, showSkipOption = true }: TeamSelectionProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            short_name,
            logo_url,
            description,
            manager:user_profiles!teams_manager_id_fkey (
              id,
              display_name
            )
          `)
          .order('name')

        if (error) throw error

        setTeams(data || [])
      } catch (err) {
        console.error('Error fetching teams:', err)
        toast({
          title: 'Error',
          description: 'Failed to load teams. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [supabase])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.short_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTeamSelect = (teamId: string) => {
    onTeamSelect(teamId === selectedTeamId ? null : teamId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in to create a team')
        return
      }

      const { data: existingTeam, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('name', teamName)
        .single()

      if (teamError && teamError.code !== 'PGRST116') {
        throw teamError
      }

      if (existingTeam) {
        setError('A team with this name already exists')
        return
      }

      const { data: team, error: createError } = await supabase
        .from('teams')
        .insert([
          {
            name: teamName,
            created_by: session.user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Update user profile with team ID
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          team_id: team.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (profileError) {
        throw profileError
      }

      router.push('/profile')
    } catch (err) {
      console.error('Error creating team:', err)
      setError('Failed to create team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-green-100">Choose Your Team</h3>
        <p className="text-gray-400">
          Select the team you want to follow. You can change this later in your profile.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
        />
      </div>

      {/* Teams Grid */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 gap-3">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <Card
                key={team.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  selectedTeamId === team.id
                    ? 'bg-gradient-to-r from-green-900/40 to-green-800/30 border-green-500/50 shadow-lg shadow-green-900/20'
                    : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50 hover:border-gray-600/50'
                }`}
                onClick={() => handleTeamSelect(team.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* Team Logo */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700/50 flex items-center justify-center">
                    {team.logo_url ? (
                      <Image
                        src={team.logo_url}
                        alt={`${team.name} logo`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white truncate">{team.name}</h4>
                      <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                        {team.short_name}
                      </Badge>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {team.description}
                      </p>
                    )}
                    {team.manager?.display_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Manager: {team.manager.display_name}
                      </p>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedTeamId === team.id
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedTeamId === team.id && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? 'No teams found matching your search.' : 'No teams available.'}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-green-400 hover:text-green-300"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Skip Option */}
      {showSkipOption && (
        <div className="text-center pt-4 border-t border-gray-700/30">
          <Button
            variant="ghost"
            onClick={() => onTeamSelect(null)}
            className="text-gray-400 hover:text-gray-300"
          >
            <Star className="w-4 h-4 mr-2" />
            Skip for now - I&apos;ll choose later
          </Button>
        </div>
      )}

      {/* Selected Team Summary */}
      {selectedTeamId && (
        <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-700/30">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">
              You&apos;ve selected{' '}
              <span className="font-medium">
                {teams.find(t => t.id === selectedTeamId)?.name}
              </span>
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </form>
    </div>
  )
} 