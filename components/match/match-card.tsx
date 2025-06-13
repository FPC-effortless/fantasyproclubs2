"use client"

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react'
import Image from 'next/image'

interface MatchCardProps {
  match: {
    id: string
    match_date: string
    status: string
    home_score?: number | null
    away_score?: number | null
    venue?: string
    competition?: {
      name: string
    }
    home_team: {
      id?: string
      name: string
      logo_url?: string | null
    }
    away_team: {
      id?: string
      name: string
      logo_url?: string | null
    }
  }
  compact?: boolean
  showCompetition?: boolean
}

export function MatchCard({ match, compact = false, showCompetition = true }: MatchCardProps) {
  const router = useRouter()

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', {
        weekday: compact ? 'short' : 'long',
        month: compact ? 'short' : 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-xs">Full Time</Badge>
      case 'live':
        return <Badge variant="destructive" className="animate-pulse text-xs">Live</Badge>
      case 'scheduled':
        return <Badge variant="secondary" className="text-xs">Upcoming</Badge>
      case 'postponed':
        return <Badge variant="outline" className="text-xs">Postponed</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const handleClick = () => {
    router.push(`/matches/${match.id}`)
  }

  const { date, time } = formatMatchDate(match.match_date)
  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'live'
  const hasScore = match.home_score !== null && match.away_score !== null

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 hover:border-green-600/40 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
      >
        <div className="flex items-center justify-between">
          {/* Teams */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/teams/${match.home_team.id || 'unknown'}`)
                }}
              >
                <Image
                  src={match.home_team.logo_url || "/placeholder-logo.png"}
                  alt={match.home_team.name}
                  width={24}
                  height={24}
                  className="rounded-full border border-gray-600 hover:border-green-500 transition-colors"
                />
              </Button>
              <span className="font-medium text-white text-sm">{match.home_team.name}</span>
            </div>
            
            <div className="text-center px-4">
              {isCompleted || isLive ? (
                <span className="font-bold text-lg text-green-400">
                  {match.home_score} - {match.away_score}
                </span>
              ) : (
                <span className="text-gray-500 font-medium text-sm">vs</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-medium text-white text-sm">{match.away_team.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/teams/${match.away_team.id || 'unknown'}`)
                }}
              >
                <Image
                  src={match.away_team.logo_url || "/placeholder-logo.png"}
                  alt={match.away_team.name}
                  width={24}
                  height={24}
                  className="rounded-full border border-gray-600 hover:border-green-500 transition-colors"
                />
              </Button>
            </div>
          </div>

          {/* Status & Time */}
          <div className="text-right">
            {getStatusBadge(match.status)}
            <p className="text-xs text-gray-400 mt-1">{time}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-green-600/40 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer"
    >
      {/* Match Status & Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusBadge(match.status)}
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{time}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{match.venue}</span>
            </div>
          )}
        </div>
        
        {showCompetition && match.competition && (
          <div className="flex items-center gap-2 text-gray-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">{match.competition.name}</span>
          </div>
        )}
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-center gap-8">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-4 justify-end">
          <div className="text-right">
            <div className="font-bold text-white text-lg">{match.home_team.name}</div>
            <div className="text-sm text-gray-400">Home</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/teams/${match.home_team.id || 'unknown'}`)
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              {match.home_team.logo_url ? (
                <Image
                  src={match.home_team.logo_url}
                  alt={match.home_team.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                match.home_team.name.charAt(0)
              )}
            </div>
          </Button>
        </div>
        
        {/* Score */}
        <div className="text-center px-6">
          {isCompleted || isLive ? (
            <div className="text-4xl font-bold text-green-400">
              {match.home_score} - {match.away_score}
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-500">
              VS
            </div>
          )}
          {isLive && (
            <div className="text-sm text-red-400 font-medium mt-2">
              LIVE
            </div>
          )}
        </div>
        
        {/* Away Team */}
        <div className="flex-1 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/teams/${match.away_team.id || 'unknown'}`)
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              {match.away_team.logo_url ? (
                <Image
                  src={match.away_team.logo_url}
                  alt={match.away_team.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                match.away_team.name.charAt(0)
              )}
            </div>
          </Button>
          <div className="text-left">
            <div className="font-bold text-white text-lg">{match.away_team.name}</div>
            <div className="text-sm text-gray-400">Away</div>
          </div>
        </div>
      </div>
    </div>
  )
} 