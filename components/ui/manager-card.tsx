"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent } from './card'
import Image from 'next/image'
import { Trophy, TrendingUp, Users, Calendar, Award } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Manager {
  id: string
  name: string
  nationality?: string
  age?: number
  years_experience?: number
  coaching_license?: string
  profile_image_url?: string | null
  team?: {
    id: string
    name: string
    logo_url?: string | null
  }
  stats?: {
    wins?: number
    losses?: number
    win_percentage?: number
    trophies?: number
    matches_managed?: number
    draws?: number
  }
}

interface ManagerCardProps {
  manager: Manager
  variant?: 'compact' | 'full' | 'minimal'
  showStats?: boolean
  className?: string
}

export function ManagerCard({ 
  manager, 
  variant = 'full', 
  showStats = true, 
  className = '' 
}: ManagerCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/managers/${manager.id}`)
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
      'Argentina': '🇦🇷',
      'Netherlands': '🇳🇱',
      'Portugal': '🇵🇹'
    }
    return flags[nationality] || '🌍'
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
            {manager.profile_image_url ? (
              <Image
                src={manager.profile_image_url}
                alt={manager.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="font-medium text-white">{manager.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Manager</span>
              {manager.nationality && (
                <>
                  <span>•</span>
                  <span>{getCountryFlag(manager.nationality)}</span>
                </>
              )}
              {manager.years_experience && (
                <>
                  <span>•</span>
                  <span>{manager.years_experience}y exp</span>
                </>
              )}
            </div>
          </div>
          
          {showStats && manager.stats && (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {manager.stats.wins !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{manager.stats.wins}</div>
                  <div>Wins</div>
                </div>
              )}
              {manager.stats.losses !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{manager.stats.losses}</div>
                  <div>Losses</div>
                </div>
              )}
              {manager.stats.draws !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{manager.stats.draws}</div>
                  <div>Draws</div>
                </div>
              )}
              {manager.stats.matches_managed !== undefined && (
                <div className="text-center">
                  <div className="text-white font-medium">{manager.stats.matches_managed}</div>
                  <div>Matches</div>
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
              {manager.profile_image_url ? (
                <Image
                  src={manager.profile_image_url}
                  alt={manager.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{manager.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-600 text-white text-xs">
                  Manager
                </Badge>
                {manager.nationality && (
                  <span className="text-lg">{getCountryFlag(manager.nationality)}</span>
                )}
              </div>
              
              {manager.years_experience && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{manager.years_experience} years experience</span>
                </div>
              )}
              
              {showStats && manager.stats && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  {manager.stats.wins !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{manager.stats.wins}</span>
                    </div>
                  )}
                  {manager.stats.losses !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{manager.stats.losses}</span>
                    </div>
                  )}
                  {manager.stats.draws !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{manager.stats.draws}</span>
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
            {manager.profile_image_url ? (
              <Image
                src={manager.profile_image_url}
                alt={manager.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{manager.name}</h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-600 text-white">
                    Manager
                  </Badge>
                  {manager.nationality && (
                    <div className="flex items-center gap-1">
                      <span className="text-xl">{getCountryFlag(manager.nationality)}</span>
                      <span className="text-gray-400 text-sm">{manager.nationality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
              {manager.age && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{manager.age} years old</span>
                </div>
              )}
              {manager.years_experience && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{manager.years_experience} years experience</span>
                </div>
              )}
            </div>
            
            {manager.team && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{manager.team.name.charAt(0)}</span>
                </div>
                <span className="text-gray-300 text-sm">{manager.team.name}</span>
              </div>
            )}
            
            {showStats && manager.stats && (
              <div className="grid grid-cols-4 gap-4 flex-row-reverse">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{manager.stats.matches_managed ?? 0}</div>
                  <div className="text-xs text-gray-400">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{manager.stats.wins ?? 0}</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-300">{manager.stats.draws ?? 0}</div>
                  <div className="text-xs text-gray-400">Draws</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{manager.stats.losses ?? 0}</div>
                  <div className="text-xs text-gray-400">Losses</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 