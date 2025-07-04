import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Trophy, Star, Crown, Coins, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: 'Rewards | Fantasy Pro Clubs',
  description: 'View and claim your rewards and prizes',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const availableRewards = [
  {
    id: 'weekly-winner',
    title: 'Weekly Winner',
    description: 'Top performer of the week',
    points: 100,
    type: 'Achievement',
    rarity: 'Epic',
    expires: '2024-12-25',
    claimable: true
  },
  {
    id: 'goal-machine',
    title: 'Goal Machine',
    description: 'Score 5 goals in a single match',
    points: 75,
    type: 'Performance',
    rarity: 'Rare',
    expires: '2024-12-31',
    claimable: true
  },
  {
    id: 'daily-login',
    title: 'Daily Login Streak',
    description: 'Login for 7 consecutive days',
    points: 25,
    type: 'Activity',
    rarity: 'Common',
    expires: '2024-12-20',
    claimable: false
  }
]

const claimedRewards = [
  {
    id: 'season-champion',
    title: 'Season Champion',
    description: 'Win the league in any season',
    points: 500,
    type: 'Championship',
    rarity: 'Legendary',
    claimedDate: '2024-11-15'
  },
  {
    id: 'first-goal',
    title: 'First Goal',
    description: 'Score your first goal',
    points: 10,
    type: 'Milestone',
    rarity: 'Common',
    claimedDate: '2024-11-01'
  }
]

export default function RewardsPage() {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
      case 'Rare':
        return 'border-blue-400/50 text-blue-400 bg-blue-400/20'
      case 'Epic':
        return 'border-purple-400/50 text-purple-400 bg-purple-400/20'
      case 'Legendary':
        return 'border-yellow-400/50 text-yellow-400 bg-yellow-400/20'
      default:
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Achievement':
        return <Trophy className="w-5 h-5" />
      case 'Performance':
        return <Star className="w-5 h-5" />
      case 'Activity':
        return <Clock className="w-5 h-5" />
      case 'Championship':
        return <Crown className="w-5 h-5" />
      case 'Milestone':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Gift className="w-5 h-5" />
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
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  REWARDS & PRIZES
                </h1>
                <p className="text-green-200/80">Claim your achievements and unlock exclusive rewards</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Available Rewards */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-green-100">Available Rewards ({availableRewards.length})</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableRewards.map((reward) => (
                <Card key={reward.id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all group relative overflow-hidden">
                  {reward.claimable && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-bl-3xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl flex items-center justify-center border border-green-600/50">
                        {getTypeIcon(reward.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-green-100 text-lg group-hover:text-green-300 transition-colors">
                          {reward.title}
                        </CardTitle>
                        <p className="text-gray-300 text-sm mt-1">{reward.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getRarityColor(reward.rarity)}>
                        {reward.rarity}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{reward.points}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Expires: {new Date(reward.expires).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button 
                      disabled={!reward.claimable}
                      className={`w-full ${
                        reward.claimable 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg' 
                          : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      } transition-all`}
                    >
                      {reward.claimable ? (
                        <span className="flex items-center gap-2">
                          Claim Reward <ArrowRight className="w-4 h-4" />
                        </span>
                      ) : (
                        'Not Available'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Claimed Rewards */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-green-100">Claimed Rewards ({claimedRewards.length})</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {claimedRewards.map((reward) => (
                <Card key={reward.id} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-green-600/30 shadow-xl relative overflow-hidden opacity-90">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-bl-3xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/40 to-green-600/40 rounded-xl flex items-center justify-center border border-green-600/60">
                        {getTypeIcon(reward.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-green-200 text-lg">{reward.title}</CardTitle>
                        <p className="text-gray-300 text-sm mt-1">{reward.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getRarityColor(reward.rarity)}>
                        {reward.rarity}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{reward.points}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Claimed: {new Date(reward.claimedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="w-full py-2 px-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center text-green-400 font-semibold">
                      ✓ Claimed
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rewards Summary */}
          <Card className="mt-12 bg-gradient-to-br from-green-800/20 to-green-900/20 backdrop-blur-sm border border-green-700/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-100 mb-2">Reward Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{availableRewards.length}</div>
                  <div className="text-gray-400 text-sm">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{claimedRewards.length}</div>
                  <div className="text-gray-400 text-sm">Claimed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {claimedRewards.reduce((sum, r) => sum + r.points, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {availableRewards.filter(r => r.claimable).length}
                  </div>
                  <div className="text-gray-400 text-sm">Ready to Claim</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
