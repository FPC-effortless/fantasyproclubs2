import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Target, Award, Lock, CheckCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: 'Achievements | Fantasy Pro Clubs',
  description: 'View your unlocked and locked achievements',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const achievements = [
  {
    id: 'first-win',
    title: 'First Win',
    description: 'Win your first match',
    icon: '🏆',
    unlocked: true,
    category: 'Beginner',
    rarity: 'Common',
    points: 10,
    progress: 100
  },
  {
    id: 'hat-trick',
    title: 'Hat-trick Hero',
    description: 'Score 3 goals in a single match',
    icon: '⚽',
    unlocked: true,
    category: 'Scoring',
    rarity: 'Rare',
    points: 25,
    progress: 100
  },
  {
    id: 'league-champion',
    title: 'League Champion',
    description: 'Win a league title',
    icon: '🥇',
    unlocked: false,
    category: 'Competition',
    rarity: 'Epic',
    points: 100,
    progress: 75
  },
  {
    id: 'golden-glove',
    title: 'Golden Glove',
    description: 'Keep 10 clean sheets in a season',
    icon: '🧤',
    unlocked: false,
    category: 'Defending',
    rarity: 'Rare',
    points: 50,
    progress: 60
  },
  {
    id: 'perfect-season',
    title: 'Perfect Season',
    description: 'Win every match in a season',
    icon: '💎',
    unlocked: false,
    category: 'Competition',
    rarity: 'Legendary',
    points: 500,
    progress: 0
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Add 50 friends to your network',
    icon: '👥',
    unlocked: false,
    category: 'Social',
    rarity: 'Common',
    points: 15,
    progress: 32
  }
]

export default function AchievementsPage() {
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beginner':
        return <Star className="w-4 h-4" />
      case 'Scoring':
        return <Target className="w-4 h-4" />
      case 'Competition':
        return <Trophy className="w-4 h-4" />
      case 'Defending':
        return <Award className="w-4 h-4" />
      case 'Social':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
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
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    ACHIEVEMENTS
                  </h1>
                  <p className="text-green-200/80">Track your progress and unlock rewards</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{unlockedAchievements.length}</div>
                  <div className="text-xs text-gray-400">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
                  <div className="text-xs text-gray-400">Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Unlocked Achievements */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-green-100">Unlocked ({unlockedAchievements.length})</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-green-600/40 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-bl-3xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl flex items-center justify-center text-2xl border border-green-600/50">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-green-100 text-lg">{achievement.title}</CardTitle>
                        <p className="text-gray-300 text-sm mt-1">{achievement.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-gray-400 text-sm">{achievement.category}</span>
                      </div>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold">+{achievement.points} points</span>
                      <span className="text-green-400 text-sm">Completed!</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Locked Achievements */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-300">Locked ({lockedAchievements.length})</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-gray-700/30 shadow-xl relative overflow-hidden opacity-75 hover:opacity-90 transition-opacity">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-bl-3xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-600/30 to-gray-700/30 rounded-xl flex items-center justify-center text-2xl border border-gray-600/50 grayscale">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-gray-300 text-lg">{achievement.title}</CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-gray-400 text-sm">{achievement.category}</span>
                      </div>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    {achievement.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-gray-300">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2 bg-gray-700/50">
                          <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all" style={{ width: `${achievement.progress}%` }} />
                        </Progress>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">+{achievement.points} points</span>
                      {achievement.progress === 0 ? (
                        <span className="text-gray-500 text-sm">Not started</span>
                      ) : (
                        <span className="text-yellow-400 text-sm">In progress...</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Progress Summary */}
          <Card className="mt-12 bg-gradient-to-br from-green-800/20 to-green-900/20 backdrop-blur-sm border border-green-700/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-100 mb-2">Achievement Progress</h3>
                             <p className="text-gray-300 mb-6">
                 You&apos;ve unlocked {unlockedAchievements.length} out of {achievements.length} achievements
               </p>
              <div className="max-w-md mx-auto">
                <Progress value={(unlockedAchievements.length / achievements.length) * 100} className="h-3 bg-gray-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all" 
                    style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }} 
                  />
                </Progress>
                <p className="text-green-400 font-bold mt-3">
                  {Math.round((unlockedAchievements.length / achievements.length) * 100)}% Complete
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
