"use client"

import { useRouter } from 'next/navigation'
import { Badge } from './badge'
import { Card, CardContent } from './card'
import { Button } from './button'
import Image from 'next/image'
import { Trophy, Users, TrendingUp, Star, Shield, Calendar } from 'lucide-react'

interface Team {
  id: string
  name: string
  short_name?: string
  logo_url?: string | null
  primary_color?: string
  secondary_color?: string
  founded_date?: string
  home_venue?: string
  stats?: {
    league_position?: number
    matches_played?: number
    wins?: number
    draws?: number
    losses?: number
    points?: number
    goals_for?: number
    goals_against?: number
    form?: Array<'W' | 'D' | 'L'>
  }
  players_count?: number
}

interface TeamCardProps {
  team: Team
  variant?: 'compact' | 'full' | 'minimal'
  showStats?: boolean
  className?: string
}

export function TeamCard({ 
  team, 
  variant = 'full', 
  showStats = true, 
  className = '' 
}: TeamCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/teams/${team.id}`)
  }

  const getFormBadge = (result: 'W' | 'D' | 'L') => {
    const colors = {
      W: 'bg-green-600 text-white',
      D: 'bg-yellow-600 text-white',
      L: 'bg-red-600 text-white'
    }
    return colors[result]
  }

  const formatFoundedDate = (dateString: string) => {
    const year = new Date(dateString).getFullYear()
    return `Est. ${year}`
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        onClick={handleClick}
        className={`h-auto p-3 justify-start hover:bg-gray-800/50 ${className}`}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={team.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${team.primary_color || '#004225'}, ${team.secondary_color || '#ffffff'}20)` 
                }}
              >
                <span className="text-white font-bold text-sm">
                  {team.short_name || team.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="font-medium text-white">{team.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{team.short_name}</span>
              {team.founded_date && (
                <>
                  <span>•</span>
                  <span>{formatFoundedDate(team.founded_date)}</span>
                </>
              )}
            </div>
          </div>
          
          {showStats && team.stats && (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {team.stats.league_position !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">#{team.stats.league_position}</div>
                  <div>Position</div>
                </div>
              )}
              {team.stats.points !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{team.stats.points}</div>
                  <div>Points</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Button>
    )
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {team.logo_url ? (
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${team.primary_color || '#004225'}, ${team.secondary_color || '#ffffff'}20)` 
                  }}
                >
                  <span className="text-white font-bold">
                    {team.short_name || team.name.substring(0, 3).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-600 text-white text-xs">
                  {team.short_name || 'TEAM'}
                </Badge>
                {team.home_venue && (
                  <span className="text-gray-400 text-xs">{team.home_venue}</span>
                )}
              </div>
              
              {showStats && team.stats && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  {team.stats.league_position !== undefined && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>#{team.stats.league_position}</span>
                    </div>
                  )}
                  {team.players_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{team.players_count}</span>
                    </div>
                  )}
                  {team.stats.points !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{team.stats.points}pts</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <Card 
      className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="relative">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={team.name}
                width={80}
                height={80}
                className="rounded-xl object-cover"
              />
            ) : (
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${team.primary_color || '#004225'}, ${team.secondary_color || '#ffffff'}20)` 
                }}
              >
                <span className="text-white font-bold text-xl">
                  {team.short_name || team.name.substring(0, 3).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-600 text-white">
                    {team.short_name || 'TEAM'}
                  </Badge>
                  {team.founded_date && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatFoundedDate(team.founded_date)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {team.stats?.league_position && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">#{team.stats.league_position}</div>
                  <div className="text-xs text-gray-400">League Position</div>
                </div>
              )}
            </div>
            
            {team.home_venue && (
              <div className="flex items-center gap-2 mb-4 text-gray-300 text-sm">
                <Shield className="w-4 h-4" />
                <span>{team.home_venue}</span>
              </div>
            )}

            {/* Recent Form */}
            {team.stats?.form && team.stats.form.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Recent Form</div>
                <div className="flex items-center gap-1">
                  {team.stats.form.slice(-5).map((result, index) => (
                    <Badge key={index} className={`${getFormBadge(result)} w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs`}>
                      {result}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {showStats && team.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {team.stats.matches_played !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{team.stats.matches_played}</div>
                    <div className="text-xs text-gray-400">Matches</div>
                  </div>
                )}
                {team.stats.wins !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{team.stats.wins}</div>
                    <div className="text-xs text-gray-400">Wins</div>
                  </div>
                )}
                {team.stats.points !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{team.stats.points}</div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                )}
                {team.players_count !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{team.players_count}</div>
                    <div className="text-xs text-gray-400">Players</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 