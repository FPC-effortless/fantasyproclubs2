import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Calendar, Target } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: 'League Details | EA FC Pro Clubs',
  description: 'View league details, standings, and information',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default async function LeagueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  LEAGUE DETAILS
                </h1>
                <p className="text-green-200/80">View standings, statistics, and team information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* League Overview Card */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  L
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    Premier League
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <Badge variant="outline" className="border-green-600/50 text-green-400 bg-green-600/20">
                      Season: 2023/24
                    </Badge>
                    <Badge variant="outline" className="border-blue-600/50 text-blue-400 bg-blue-600/20">
                      20 Teams
                    </Badge>
                    <Badge variant="outline" className="border-purple-600/50 text-purple-400 bg-purple-600/20">
                      38 Matches
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* League Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">20</div>
                  <div className="text-gray-400 text-sm">Teams</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">38</div>
                  <div className="text-gray-400 text-sm">Matches</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">156</div>
                  <div className="text-gray-400 text-sm">Goals</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">82%</div>
                  <div className="text-gray-400 text-sm">Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standings Table */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-400" />
                League Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700/50">
                      <th className="pb-4 text-green-300">#</th>
                      <th className="pb-4 text-green-300">Team</th>
                      <th className="pb-4 text-green-300">P</th>
                      <th className="pb-4 text-green-300">W</th>
                      <th className="pb-4 text-green-300">D</th>
                      <th className="pb-4 text-green-300">L</th>
                      <th className="pb-4 text-green-300">GD</th>
                      <th className="pb-4 text-green-300">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {[
                      { team: 'FC Pro Stars', p: 20, w: 15, d: 3, l: 2, gd: 27, pts: 48 },
                      { team: 'Elite FC', p: 20, w: 14, d: 4, l: 2, gd: 22, pts: 46 },
                      { team: 'Champions FC', p: 20, w: 12, d: 5, l: 3, gd: 18, pts: 41 },
                      { team: 'Victory United', p: 20, w: 11, d: 6, l: 3, gd: 15, pts: 39 },
                      { team: 'Rising Stars', p: 20, w: 10, d: 7, l: 3, gd: 12, pts: 37 },
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-gray-700/20 transition-colors">
                        <td className="py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black' :
                            index <= 2 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                            'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-gray-100">{row.team}</td>
                        <td className="py-4 text-gray-300">{row.p}</td>
                        <td className="py-4 text-green-400">{row.w}</td>
                        <td className="py-4 text-yellow-400">{row.d}</td>
                        <td className="py-4 text-red-400">{row.l}</td>
                        <td className="py-4 text-gray-300">+{row.gd}</td>
                        <td className="py-4 font-bold text-green-400">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 