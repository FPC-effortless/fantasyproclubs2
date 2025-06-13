import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Trophy, Medal, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Leaderboards | Fantasy Pro Clubs',
  description: 'View global and league leaderboards',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function LeaderboardsPage() {
  const globalLeaderboard = [
    { name: 'John Smith', points: 1200 },
    { name: 'Mike Johnson', points: 1150 },
    { name: 'David Brown', points: 1100 },
  ]

  const leagueLeaderboard = [
    { team: 'FC Pro Stars', points: 1400 },
    { team: 'Elite FC', points: 1350 },
    { team: 'Champions FC', points: 1300 },
  ]

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Star className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">{index + 1}</div>
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  LEADERBOARDS
                </h1>
                <p className="text-green-200/80">View global and league rankings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-green-100">Global Leaderboard</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700/50">
                      <th className="pb-4 text-green-100 font-medium">#</th>
                      <th className="pb-4 text-green-100 font-medium">Player</th>
                      <th className="pb-4 text-green-100 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {globalLeaderboard.map((player, index) => (
                      <tr key={index} className="hover:bg-green-900/10 transition-colors">
                        <td className="py-4 flex items-center gap-2">
                          {getRankIcon(index)}
                        </td>
                        <td className="py-4 text-gray-200">{player.name}</td>
                        <td className="py-4 text-green-400 font-semibold">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Medal className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-green-100">League Leaderboard</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700/50">
                      <th className="pb-4 text-green-100 font-medium">#</th>
                      <th className="pb-4 text-green-100 font-medium">Team</th>
                      <th className="pb-4 text-green-100 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {leagueLeaderboard.map((team, index) => (
                      <tr key={index} className="hover:bg-green-900/10 transition-colors">
                        <td className="py-4 flex items-center gap-2">
                          {getRankIcon(index)}
                        </td>
                        <td className="py-4 text-gray-200">{team.team}</td>
                        <td className="py-4 text-green-400 font-semibold">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
