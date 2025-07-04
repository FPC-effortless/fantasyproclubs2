import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRightLeft, Search, Plus, Eye, Filter, TrendingUp, Star, Users, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: 'Transfer Market | Fantasy Pro Clubs',
  description: 'Browse and manage player transfers',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const availablePlayers = [
  { 
    id: 1,
    name: 'John Smith', 
    position: 'ST', 
    rating: 85, 
    club: 'FC Pro Stars', 
    value: '€12M',
    avatar: 'JS',
    age: 25,
    nationality: 'England',
    goals: 23,
    assists: 8,
    trending: true
  },
  { 
    id: 2,
    name: 'Mike Johnson', 
    position: 'CM', 
    rating: 83, 
    club: 'Elite FC', 
    value: '€9M',
    avatar: 'MJ',
    age: 27,
    nationality: 'Spain',
    goals: 8,
    assists: 15,
    trending: false
  },
  { 
    id: 3,
    name: 'David Brown', 
    position: 'CB', 
    rating: 82, 
    club: 'Champions FC', 
    value: '€8M',
    avatar: 'DB',
    age: 29,
    nationality: 'Brazil',
    goals: 3,
    assists: 2,
    trending: false
  },
  {
    id: 4,
    name: 'Alex Wilson',
    position: 'GK',
    rating: 86,
    club: 'Victory FC',
    value: '€10M',
    avatar: 'AW',
    age: 24,
    nationality: 'Germany',
    goals: 0,
    assists: 1,
    trending: true
  }
]

export default function TransferMarketPage() {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'ST':
        return 'border-red-400/50 text-red-400 bg-red-400/20'
      case 'CM':
        return 'border-green-400/50 text-green-400 bg-green-400/20'
      case 'CB':
        return 'border-blue-400/50 text-blue-400 bg-blue-400/20'
      case 'GK':
        return 'border-yellow-400/50 text-yellow-400 bg-yellow-400/20'
      default:
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-400'
    if (rating >= 80) return 'text-blue-400'
    if (rating >= 75) return 'text-yellow-400'
    return 'text-gray-400'
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        {/* Enhanced Header */}
        <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowRightLeft className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    TRANSFER MARKET
                  </h1>
                  <p className="text-green-200/80">Browse and manage player transfers</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
              New Transfer
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Search and Filters */}
          <Card className="mb-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    type="text" 
                    placeholder="Search players by name, position, or club..." 
                    className="pl-10 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                  />
                </div>
                <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500 whitespace-nowrap">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Market Statistics */}
          <Card className="mb-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-100 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-600/30">
                  <div className="text-2xl font-bold text-green-400 mb-1">{availablePlayers.length}</div>
                  <div className="text-gray-400 text-sm">Available Players</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-600/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1">€39M</div>
                  <div className="text-gray-400 text-sm">Total Market Value</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-600/30">
                  <div className="text-2xl font-bold text-purple-400 mb-1">84</div>
                  <div className="text-gray-400 text-sm">Avg Rating</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-600/30">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">2</div>
                  <div className="text-gray-400 text-sm">Trending Players</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Players */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Available Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                    <tr className="text-left border-b border-gray-700/50">
                      <th className="pb-4 text-green-100">Player</th>
                      <th className="pb-4 text-green-100">Position</th>
                      <th className="pb-4 text-green-100">Rating</th>
                      <th className="pb-4 text-green-100">Current Club</th>
                      <th className="pb-4 text-green-100">Stats</th>
                      <th className="pb-4 text-green-100">Value</th>
                      <th className="pb-4 text-green-100">Actions</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {availablePlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-gradient-to-r hover:from-gray-700/20 hover:to-gray-800/20 transition-all group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                                <span className="text-green-300 font-bold">{player.avatar}</span>
                              </div>
                              {player.trending && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <TrendingUp className="w-2 h-2 text-black" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-green-100 group-hover:text-green-300 transition-colors">
                                {player.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {player.nationality} • Age {player.age}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline" className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <span className={`text-xl font-bold ${getRatingColor(player.rating)}`}>
                            {player.rating}
                          </span>
                        </td>
                        <td className="py-4 text-gray-300">{player.club}</td>
                        <td className="py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-gray-300">{player.goals}G</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-blue-400" />
                              <span className="text-gray-300">{player.assists}A</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-green-400 font-bold">
                            <DollarSign className="w-4 h-4" />
                            {player.value}
                        </div>
                      </td>
                      <td className="py-4">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                          View
                          </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {availablePlayers.map((player) => (
                  <div key={player.id} className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                            <span className="text-green-300 font-bold">{player.avatar}</span>
                          </div>
                          {player.trending && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-2 h-2 text-black" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-green-100">{player.name}</div>
                          <div className="text-sm text-gray-400">{player.nationality} • Age {player.age}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(player.rating)}`}>
                          {player.rating}
                        </div>
                        <Badge variant="outline" className={getPositionColor(player.position)}>
                          {player.position}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-300">{player.club}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          {player.goals}G
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          {player.assists}A
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-400 font-bold">
                        <DollarSign className="w-4 h-4" />
                        {player.value}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
