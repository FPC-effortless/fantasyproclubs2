"use client"

import { Users, User, RotateCcw, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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
  match_events?: any[]
  match_stats?: any
}

interface MatchLineupProps {
  match: Match
}

interface Player {
  id: string
  name: string
  position: string
  number: number
  rating?: number
  goals?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  substituted?: boolean
  substitutedAt?: number
  substituteFor?: string
  avatar_url?: string
}

interface TeamLineup {
  formation: string
  players: Player[]
  manager: string
  manager_id?: string
  manager_avatar_url?: string
}

// Add position mapping function
const getStandardizedPosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    // Goalkeeper
    'GK': 'GK',
    
    // Defenders
    'CB': 'DEF',
    'LB': 'DEF',
    'RB': 'DEF',
    'LWB': 'DEF',
    'RWB': 'DEF',
    
    // Midfielders
    'CDM': 'MID',
    'CM': 'MID',
    'CAM': 'MID',
    'LM': 'MID',
    'RM': 'MID',
    'LW': 'MID',
    'RW': 'MID',
    
    // Forwards
    'ST': 'FWD',
    'CF': 'FWD',
  }
  
  return positionMap[position] || position
}

export function MatchLineup({ match }: MatchLineupProps) {
  // Mock lineup data
  const homeLineup: TeamLineup = {
    formation: '4-3-3',
    manager: 'Pep Guardiola',
    players: [
      { id: '1', name: 'Ederson', position: 'GK', number: 31, rating: 7.2 },
      { id: '2', name: 'Walker', position: 'RB', number: 2, rating: 7.5 },
      { id: '3', name: 'Stones', position: 'CB', number: 5, rating: 7.8 },
      { id: '4', name: 'Dias', position: 'CB', number: 3, rating: 7.6 },
      { id: '5', name: 'Cancelo', position: 'LB', number: 7, rating: 7.4 },
      { id: '6', name: 'Rodri', position: 'CDM', number: 16, rating: 8.1 },
      { id: '7', name: 'De Bruyne', position: 'CM', number: 17, rating: 8.5 },
      { id: '8', name: 'Silva', position: 'CM', number: 20, rating: 7.9, substituted: true, substitutedAt: 75 },
      { id: '9', name: 'Mahrez', position: 'RW', number: 26, rating: 7.7 },
      { id: '10', name: 'Haaland', position: 'ST', number: 9, rating: 8.9, goals: 2 },
      { id: '11', name: 'Grealish', position: 'LW', number: 10, rating: 7.3, assists: 1 }
    ]
  }

  const awayLineup: TeamLineup = {
    formation: '4-2-3-1',
    manager: 'Mikel Arteta',
    players: [
      { id: '21', name: 'Ramsdale', position: 'GK', number: 1, rating: 6.8 },
      { id: '22', name: 'White', position: 'RB', number: 4, rating: 6.9 },
      { id: '23', name: 'Saliba', position: 'CB', number: 12, rating: 7.1 },
      { id: '24', name: 'Gabriel', position: 'CB', number: 6, rating: 6.7, yellowCards: 1 },
      { id: '25', name: 'Zinchenko', position: 'LB', number: 35, rating: 6.5 },
      { id: '26', name: 'Partey', position: 'CDM', number: 5, rating: 7.0 },
      { id: '27', name: 'Rice', position: 'CDM', number: 41, rating: 7.3 },
      { id: '28', name: 'Saka', position: 'RW', number: 7, rating: 7.8 },
      { id: '29', name: 'Odegaard', position: 'AM', number: 8, rating: 7.5 },
      { id: '30', name: 'Martinelli', position: 'LW', number: 11, rating: 7.2 },
      { id: '31', name: 'Jesus', position: 'ST', number: 9, rating: 6.6, goals: 1 }
    ]
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-400'
    if (rating >= 7.5) return 'text-blue-400'
    if (rating >= 7.0) return 'text-yellow-400'
    if (rating >= 6.5) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRatingBg = (rating: number) => {
    if (rating >= 8.5) return 'bg-green-500'
    if (rating >= 7.5) return 'bg-blue-500'
    if (rating >= 7.0) return 'bg-yellow-500'
    if (rating >= 6.5) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const PlayerCard = ({ player, isHome }: { player: Player; isHome: boolean }) => (
    <Link href={player.id ? `/players/${player.id}` : '#'} className="block group">
      <div className={`
        relative bg-gray-700/30 rounded-lg p-3 border transition-all hover:bg-gray-700/50
        ${isHome ? 'border-green-500/30' : 'border-blue-500/30'}
        ${player.substituted ? 'opacity-60' : ''}
        group-hover:ring-2 group-hover:ring-green-400/30
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt={player.name} className={`w-8 h-8 rounded-full object-cover ${isHome ? 'ring-green-500' : 'ring-blue-500'} ring-2`} />
            ) : (
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                ${isHome ? 'bg-green-600' : 'bg-blue-600'}
              `}>
                {player.number}
              </div>
            )}
            <div>
              <p className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">{player.name}</p>
              <p className="text-xs text-gray-400">{getStandardizedPosition(player.position)}</p>
            </div>
          </div>
          {player.rating && (
            <div className={`
              px-2 py-1 rounded text-xs font-bold text-white
              ${getRatingBg(player.rating)}
            `}>
              {player.rating}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {player.goals && player.goals > 0 && (
            <Badge variant="default" className="text-xs bg-green-500">
              ⚽ {player.goals}
            </Badge>
          )}
          {player.assists && player.assists > 0 && (
            <Badge variant="default" className="text-xs bg-blue-500">
              🅰️ {player.assists}
            </Badge>
          )}
          {player.yellowCards && player.yellowCards > 0 && (
            <Badge variant="default" className="text-xs bg-yellow-500 text-black">
              🟨 {player.yellowCards}
            </Badge>
          )}
          {player.redCards && player.redCards > 0 && (
            <Badge variant="default" className="text-xs bg-red-500">
              🟥 {player.redCards}
            </Badge>
          )}
          {player.substituted && (
            <Badge variant="outline" className="text-xs">
              ↓ {player.substitutedAt}&apos;
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )

  const FormationDisplay = ({ lineup, isHome }: { lineup: TeamLineup; isHome: boolean }) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-1">
          {isHome ? match.home_team.name : match.away_team.name}
        </h3>
        <p className="text-sm text-gray-400">{lineup.formation}</p>
        <p className="text-xs text-gray-500">Manager: {lineup.manager}</p>
      </div>
      
      <div className="grid gap-2">
        {lineup.players.map((player) => (
          <PlayerCard key={player.id} player={player} isHome={isHome} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Formation Overview */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Team Lineups
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <span>{match.home_team.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span>{match.away_team.name}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {match.home_team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{match.home_team.name}</h3>
                  <p className="text-sm text-gray-400">{homeLineup.formation}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Starting XI
              </h4>
              <div className="grid gap-2">
                {homeLineup.players.map((player) => (
                  <PlayerCard key={player.id} player={player} isHome={true} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {match.away_team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{match.away_team.name}</h3>
                  <p className="text-sm text-gray-400">{awayLineup.formation}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Starting XI
              </h4>
              <div className="grid gap-2">
                {awayLineup.players.map((player) => (
                  <PlayerCard key={player.id} player={player} isHome={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Managers Section */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Team Managers
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href={homeLineup.manager_id ? `/managers/${homeLineup.manager_id}` : '#'} className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 group">
            {homeLineup.manager_avatar_url ? (
              <img src={homeLineup.manager_avatar_url} alt={homeLineup.manager} className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500" />
            ) : (
              <User className="w-8 h-8 text-green-400" />
            )}
            <div>
              <p className="text-sm text-gray-400 mb-1">Home Manager</p>
              <p className="font-medium text-white group-hover:text-green-400 transition-colors">{homeLineup.manager}</p>
            </div>
          </Link>
          <Link href={awayLineup.manager_id ? `/managers/${awayLineup.manager_id}` : '#'} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3 group">
            {awayLineup.manager_avatar_url ? (
              <img src={awayLineup.manager_avatar_url} alt={awayLineup.manager} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
            ) : (
              <User className="w-8 h-8 text-blue-400" />
            )}
            <div>
              <p className="text-sm text-gray-400 mb-1">Away Manager</p>
              <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{awayLineup.manager}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 