import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import styles from './team-stats.module.css'

export const metadata: Metadata = {
  title: 'Team Statistics | EA FC Pro Clubs',
  description: 'View detailed team statistics and performance metrics',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default async function TeamStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#00ff87]">Team Statistics</h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors">
                Export Stats
              </button>
              <button className="px-4 py-2 border border-[#00ff87] text-[#00ff87] rounded-lg hover:bg-[#00ff87]/10 transition-colors">
                Compare Teams
              </button>
            </div>
          </div>

          {/* Season Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Matches</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Played</p>
                  <p className="text-2xl font-bold">20</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-gray-400">Won</p>
                    <p className="text-lg text-[#00ff87]">15</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Drawn</p>
                    <p className="text-lg">3</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Lost</p>
                    <p className="text-lg text-red-500">2</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Goals</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Scored</p>
                  <p className="text-2xl font-bold text-[#00ff87]">45</p>
                </div>
                <div>
                  <p className="text-gray-400">Conceded</p>
                  <p className="text-2xl font-bold text-red-500">18</p>
                </div>
                <div>
                  <p className="text-gray-400">Goal Difference</p>
                  <p className="text-lg">+27</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Possession</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Average</p>
                  <p className="text-2xl font-bold">58%</p>
                </div>
                <div>
                  <p className="text-gray-400">Pass Accuracy</p>
                  <p className="text-lg">85%</p>
                </div>
                <div>
                  <p className="text-gray-400">Shots per Game</p>
                  <p className="text-lg">12.5</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Defense</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Clean Sheets</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div>
                  <p className="text-gray-400">Tackles Won</p>
                  <p className="text-lg">75%</p>
                </div>
                <div>
                  <p className="text-gray-400">Interceptions</p>
                  <p className="text-lg">12.3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Goals per Match</h2>
              <div className="h-64 bg-[#1a1a1a] rounded-lg flex items-end justify-around p-4">
                {[2, 3, 1, 4, 2, 3, 2].map((goals, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={styles.goalsBar}
                      style={{ height: `${goals * 16}px` }}
                    />
                    <span className="text-sm mt-2">M{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Possession Trend</h2>
              <div className="h-64 bg-[#1a1a1a] rounded-lg flex items-end justify-around p-4">
                {[55, 62, 58, 60, 54, 59, 58].map((possession, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={styles.possessionBar}
                      style={{ height: `${possession * 2}px` }}
                    />
                    <span className="text-sm mt-2">M{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player Performance */}
          <div className="bg-[#111111] rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Top Performers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-4">Player</th>
                    <th className="pb-4">Position</th>
                    <th className="pb-4">Goals</th>
                    <th className="pb-4">Assists</th>
                    <th className="pb-4">Pass Accuracy</th>
                    <th className="pb-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    { name: 'John Smith', position: 'ST', goals: 12, assists: 4, passAccuracy: 78, rating: 8.5 },
                    { name: 'Mike Johnson', position: 'CM', goals: 5, assists: 8, passAccuracy: 89, rating: 8.2 },
                    { name: 'David Brown', position: 'RW', goals: 8, assists: 6, passAccuracy: 82, rating: 8.0 },
                    { name: 'James Wilson', position: 'CB', goals: 2, assists: 1, passAccuracy: 91, rating: 7.8 },
                  ].map((player, index) => (
                    <tr key={index} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#00ff87]">{player.name[0]}</span>
                          </div>
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-4">{player.position}</td>
                      <td className="py-4">{player.goals}</td>
                      <td className="py-4">{player.assists}</td>
                      <td className="py-4">{player.passAccuracy}%</td>
                      <td className="py-4">{player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 