"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent } from './card'
import Image from 'next/image'
import { Trophy, Target, Users, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  name: string
  position: string
  jersey_number?: number
  nationality?: string
  profile_image_url?: string | null
  team?: {
    id: string
    name: string
    logo_url?: string | null
  }
  stats?: {
    goals?: number
    assists?: number
    appearances?: number
    rating?: number
    clean_sheets?: number
  }
}

interface PlayerCardProps {
  player: Player
  variant?: 'compact' | 'full' | 'minimal'
  showStats?: boolean
  className?: string
  contract_expiry?: string // ISO date string
  showPlayerStats?: boolean // for stats tab
}

function getTimeLeft(expiry: string) {
  const now = new Date()
  const end = new Date(expiry)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return { days, hours, minutes }
}

export function PlayerCard({ 
  player, 
  variant = 'full', 
  showStats = true, 
  className = '',
  contract_expiry,
  showPlayerStats = false
}: PlayerCardProps) {
  const router = useRouter()

  const [timeLeft, setTimeLeft] = useState<null | { days: number, hours: number, minutes: number }>(null)

  useEffect(() => {
    if (!contract_expiry) return
    const update = () => setTimeLeft(getTimeLeft(contract_expiry))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [contract_expiry])

  const handleClick = () => {
    router.push(`/players/${player.id}`)
  }

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Ireland': '🇮🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷'
    }
    return flags[nationality] || '🌍'
  }

  const getPositionColor = (position: string) => {
    const positionColors: { [key: string]: string } = {
      'Goalkeeper': 'bg-yellow-600',
      'Defender': 'bg-blue-600',
      'Midfielder': 'bg-green-600',
      'Forward': 'bg-red-600',
      'Striker': 'bg-red-600'
    }
    return positionColors[position] || 'bg-gray-600'
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
            {player.profile_image_url ? (
              <Image
                src={player.profile_image_url}
                alt={player.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {player.name.charAt(0)}
                </span>
              </div>
            )}
            {player.jersey_number && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{player.jersey_number}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="font-medium text-white">{player.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{player.position}</span>
              {player.nationality && (
                <>
                  <span>•</span>
                  <span>{getCountryFlag(player.nationality)}</span>
                </>
              )}
            </div>
          </div>
          
          {showStats && player.stats && (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {player.stats.goals !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{player.stats.goals}</div>
                  <div>Goals</div>
                </div>
              )}
              {player.stats.assists !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{player.stats.assists}</div>
                  <div>Assists</div>
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
              {player.profile_image_url ? (
                <Image
                  src={player.profile_image_url}
                  alt={player.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {player.name.charAt(0)}
                  </span>
                </div>
              )}
              {player.jersey_number && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {player.jersey_number}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{player.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                  {player.position}
                </Badge>
                {player.nationality && (
                  <span className="text-lg">{getCountryFlag(player.nationality)}</span>
                )}
              </div>
              
              {showStats && player.stats && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  {player.stats.goals !== undefined && (
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{player.stats.goals}</span>
                    </div>
                  )}
                  {player.stats.assists !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{player.stats.assists}</span>
                    </div>
                  )}
                  {player.stats.rating !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{player.stats.rating}</span>
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
      className={`flex flex-row items-center gap-6 w-full bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${className}`}
      onClick={handleClick}
    >
      <CardContent className="flex flex-row items-center gap-6 w-full py-6">
        <div className="relative">
          {player.profile_image_url ? (
            <Image
              src={player.profile_image_url}
              alt={player.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{player.name.charAt(0)}</span>
            </div>
          )}
          {player.jersey_number && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {player.jersey_number}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white truncate">{player.name}</h3>
            <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>{player.position}</Badge>
            {player.nationality && <span className="text-lg">{getCountryFlag(player.nationality)}</span>}
          </div>
        </div>
        {contract_expiry && (
          <div className="flex flex-col items-end min-w-[160px]">
            <span className="text-xs text-gray-400 mb-1">Contract expires in</span>
            {timeLeft ? (
              <span className="text-lg font-bold text-yellow-400">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            ) : (
              <span className="text-lg font-bold text-red-500">Expired</span>
            )}
          </div>
        )}
        {showPlayerStats && player.stats && (
          <div className="flex gap-6 ml-6 text-xs text-gray-400">
            <div className="flex flex-col items-center">
              <span className="font-bold text-white">{player.stats.appearances ?? 0}</span>
              <span>Matches</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-green-400">{player.stats.goals ?? 0}</span>
              <span>Goals</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-yellow-400">{player.stats.assists ?? 0}</span>
              <span>Assists</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-blue-400">{player.stats.clean_sheets ?? 0}</span>
              <span>Clean Sheets</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-purple-400">{player.stats.rating ?? 0}</span>
              <span>Avg Rating</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 