"use client"

import { Target, Clock, MapPin, Users, Trophy } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface MatchEvent {
  id: string
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty'
  minute: number
  team_type: 'home' | 'away'
  player_name: string
  description?: string
}

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  venue?: string
  competition: {
    id: string
    name: string
    type: string
  }
  home_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  away_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  match_events?: MatchEvent[]
  match_stats?: any
}

interface MatchOverviewProps {
  match: Match
}

export function MatchOverview({ match }: MatchOverviewProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <div className="w-3 h-3 rounded-full bg-green-400" />
      case 'yellow_card':
        return <div className="w-3 h-3 rounded-sm bg-yellow-400" />
      case 'red_card':
        return <div className="w-3 h-3 rounded-sm bg-red-500" />
      case 'substitution':
        return <div className="w-3 h-3 rounded-full bg-blue-400" />
      case 'penalty':
        return <div className="w-3 h-3 rounded-full bg-purple-400" />
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'Goal'
      case 'yellow_card':
        return 'Yellow Card'
      case 'red_card':
        return 'Red Card'
      case 'substitution':
        return 'Substitution'
      case 'penalty':
        return 'Penalty'
      default:
        return type
    }
  }

  const events = match.match_events || []

  return (
    <div className="space-y-6">
      {/* Match Summary */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Match Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Duration</span>
            </div>
            <p className="text-lg font-bold text-white">90&apos;</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Venue</span>
            </div>
            <p className="text-lg font-bold text-white">{match.venue || 'Stadium'}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Competition</span>
            </div>
            <p className="text-lg font-bold text-white">{match.competition.name}</p>
          </div>
        </div>
      </div>

      {/* Match Timeline */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Match Timeline</h2>
        
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id || index} className="flex items-center gap-4 p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors">
                <div className="w-12 h-12 bg-gray-600/50 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm text-white">{event.minute}&apos;</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <span className="font-medium text-white">{getEventLabel(event.type)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.team_type === 'home' ? 'default' : 'secondary'}>
                      {event.team_type === 'home' ? match.home_team.name : match.away_team.name}
                    </Badge>
                    <span className="font-medium text-white">{event.player_name}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Events Recorded</h3>
            <p className="text-gray-400">Match events will be available after the match starts.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {match.match_stats && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {match.match_stats.home_possession}%
              </div>
              <div className="text-sm text-gray-400">Home Possession</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {match.match_stats.away_possession}%
              </div>
              <div className="text-sm text-gray-400">Away Possession</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {match.match_stats.home_shots}
              </div>
              <div className="text-sm text-gray-400">Home Shots</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {match.match_stats.away_shots}
              </div>
              <div className="text-sm text-gray-400">Away Shots</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 