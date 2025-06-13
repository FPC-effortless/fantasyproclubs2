import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, UserPlus, MessageCircle, UserMinus, Mail, Trophy, Clock, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Friends | Fantasy Pro Clubs',
  description: 'View and manage your friends list',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const friends = [
  { 
    id: 1,
    name: 'Mike Johnson', 
    status: 'Online', 
    lastActive: 'Now',
    avatar: 'MJ',
    club: 'FC Pro Stars',
    level: 85,
    mutualFriends: 12
  },
  { 
    id: 2,
    name: 'David Brown', 
    status: 'Offline', 
    lastActive: '2h ago',
    avatar: 'DB',
    club: 'Elite FC',
    level: 78,
    mutualFriends: 8
  },
  { 
    id: 3,
    name: 'James Wilson', 
    status: 'Online', 
    lastActive: 'Now',
    avatar: 'JW',
    club: 'Champions FC',
    level: 92,
    mutualFriends: 15
  },
  { 
    id: 4,
    name: 'Alex Thompson', 
    status: 'In Match', 
    lastActive: 'Playing',
    avatar: 'AT',
    club: 'Pro United',
    level: 88,
    mutualFriends: 6
  }
]

const friendRequests = [
  {
    id: 1,
    name: 'Sarah Miller',
    avatar: 'SM',
    club: 'Victory FC',
    level: 75,
    mutualFriends: 3,
    timeAgo: '2h ago'
  },
  {
    id: 2,
    name: 'Chris Anderson',
    avatar: 'CA',
    club: 'Thunder FC',
    level: 81,
    mutualFriends: 7,
    timeAgo: '1d ago'
  }
]

export default function FriendsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'border-green-400/50 text-green-400 bg-green-400/20'
      case 'In Match':
        return 'border-blue-400/50 text-blue-400 bg-blue-400/20'
      case 'Offline':
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
      default:
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
    }
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
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    FRIENDS
                  </h1>
                  <p className="text-green-200/80">Connect and compete with other players</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{friends.length}</div>
                  <div className="text-xs text-gray-400">Total Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{friends.filter(f => f.status === 'Online').length}</div>
                  <div className="text-xs text-gray-400">Online Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Search and Add Friend */}
          <Card className="mb-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    type="text" 
                    placeholder="Search friends by name or username..." 
                    className="pl-10 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                  />
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg whitespace-nowrap">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Friends List */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Your Friends ({friends.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-600/30 hover:border-green-600/40 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                              <span className="text-green-300 font-bold">{friend.avatar}</span>
                            </div>
                            {friend.status === 'Online' && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-green-100 group-hover:text-green-300 transition-colors">
                                {friend.name}
                              </span>
                              <Badge variant="outline" className={getStatusColor(friend.status)}>
                                {friend.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  Level {friend.level}
                                </span>
                                <span>{friend.club}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {friend.lastActive}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {friend.mutualFriends} mutual
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500">
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Friend Requests */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-blue-100 text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Friend Requests ({friendRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-lg border border-blue-600/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full flex items-center justify-center border border-blue-600/50">
                          <span className="text-blue-300 font-bold text-sm">{request.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-blue-100 text-sm">{request.name}</div>
                          <div className="text-xs text-gray-400">{request.club} • Level {request.level}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">
                        {request.mutualFriends} mutual friends • {request.timeAgo}
                  </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-gray-600/50 text-gray-400 hover:bg-gray-600/20 text-xs">
                          Decline
                        </Button>
                  </div>
                </div>
              ))}
                </CardContent>
              </Card>

              {/* Online Friends Quick Access */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Online Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {friends.filter(f => f.status === 'Online' || f.status === 'In Match').map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-lg border border-green-600/20">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                          <span className="text-green-300 font-bold text-xs">{friend.avatar}</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-green-100 text-sm">{friend.name}</div>
                        <div className="text-xs text-gray-400">{friend.status}</div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-600/20 p-1">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
