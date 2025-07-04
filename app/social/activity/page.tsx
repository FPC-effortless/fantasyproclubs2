import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Trophy, Users, UserPlus, Clock, Target, Award, MessageCircle, Heart, Share } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: 'Activity Feed | Fantasy Pro Clubs',
  description: 'See recent activity from your friends and clubs',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const activities = [
  { 
    id: 1,
    user: 'Mike Johnson', 
    action: 'scored a hat-trick', 
    target: 'in FC Pro Stars vs Elite FC', 
    time: '2h ago',
    type: 'achievement',
    avatar: 'MJ',
    likes: 15,
    comments: 3
  },
  { 
    id: 2,
    user: 'David Brown', 
    action: 'joined', 
    target: 'Champions FC', 
    time: '5h ago',
    type: 'join',
    avatar: 'DB',
    likes: 8,
    comments: 1
  },
  { 
    id: 3,
    user: 'James Wilson', 
    action: 'sent you a friend request', 
    target: '', 
    time: '1d ago',
    type: 'friend_request',
    avatar: 'JW',
    likes: 0,
    comments: 0
  },
  { 
    id: 4,
    user: 'Alex Thompson', 
    action: 'won Player of the Week', 
    target: '', 
    time: '2d ago',
    type: 'award',
    avatar: 'AT',
    likes: 23,
    comments: 7
  },
  {
    id: 5,
    user: 'Sarah Miller',
    action: 'completed the challenge',
    target: '"Score 10 Goals"',
    time: '3d ago',
    type: 'challenge',
    avatar: 'SM',
    likes: 12,
    comments: 2
  },
  {
    id: 6,
    user: 'Chris Anderson',
    action: 'reached Level 90',
    target: '',
    time: '4d ago',
    type: 'level_up',
    avatar: 'CA',
    likes: 18,
    comments: 5
  }
]

export default function ActivityFeedPage() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Target className="w-5 h-5 text-green-400" />
      case 'join':
        return <Users className="w-5 h-5 text-blue-400" />
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-purple-400" />
      case 'award':
        return <Award className="w-5 h-5 text-yellow-400" />
      case 'challenge':
        return <Trophy className="w-5 h-5 text-orange-400" />
      case 'level_up':
        return <Target className="w-5 h-5 text-cyan-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-green-600/10 to-green-700/10 border-green-600/30'
      case 'join':
        return 'from-blue-600/10 to-blue-700/10 border-blue-600/30'
      case 'friend_request':
        return 'from-purple-600/10 to-purple-700/10 border-purple-600/30'
      case 'award':
        return 'from-yellow-600/10 to-yellow-700/10 border-yellow-600/30'
      case 'challenge':
        return 'from-orange-600/10 to-orange-700/10 border-orange-600/30'
      case 'level_up':
        return 'from-cyan-600/10 to-cyan-700/10 border-cyan-600/30'
      default:
        return 'from-gray-600/10 to-gray-700/10 border-gray-600/30'
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  ACTIVITY FEED
                </h1>
                <p className="text-green-200/80">See recent activity from your friends and clubs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          {/* Activity Feed */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="border-green-600/50 text-green-400 bg-green-600/20">
                  Live Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-4 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-lg border hover:scale-[1.01] transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                        <span className="text-green-300 font-bold">{activity.avatar}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-600">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-green-100 group-hover:text-green-300 transition-colors">
                            <span className="font-semibold text-green-300">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            {activity.target && (
                              <span className="text-gray-300 font-medium">{activity.target}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0 ml-4">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>

                      {/* Interaction Bar */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-600/30">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-xs">{activity.likes}</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-1"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">{activity.comments}</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-green-400 hover:bg-green-400/10 p-1"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More */}
              <div className="text-center pt-6">
                <Button 
                  variant="outline" 
                  className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500"
                >
                  Load More Activities
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card className="mt-8 bg-gradient-to-br from-green-800/20 to-green-900/20 backdrop-blur-sm border border-green-700/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-400" />
                Your Activity Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-600/30">
                  <div className="text-2xl font-bold text-green-400 mb-1">12</div>
                  <div className="text-gray-400 text-sm">This Week</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-600/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1">45</div>
                  <div className="text-gray-400 text-sm">Total Likes</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-600/30">
                  <div className="text-2xl font-bold text-purple-400 mb-1">8</div>
                  <div className="text-gray-400 text-sm">Comments</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-600/30">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">3</div>
                  <div className="text-gray-400 text-sm">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
