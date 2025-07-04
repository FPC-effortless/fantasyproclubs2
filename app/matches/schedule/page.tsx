import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { MatchList } from '@/components/matches/match-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Filter, Plus, Clock, Trophy, Users, Target } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: 'Match Schedule | Fantasy Pro Clubs',
  description: 'View upcoming matches and schedule',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function MatchSchedulePage() {
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    MATCH SCHEDULE
                  </h1>
                  <p className="text-green-200/80">View upcoming matches and manage your calendar</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Matches
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Schedule Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Next Match */}
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-green-100 text-xl">Next Match</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-600/50">
                      <span className="text-green-300 font-bold text-sm">FC</span>
                    </div>
                    <div>
                      <span className="font-medium">FC Pro Stars</span>
                      <div className="text-xs text-gray-400">Home</div>
                    </div>
                  </div>
                  <div className="text-center text-gray-400 text-sm font-medium">
                    vs
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium">Elite FC</span>
                      <div className="text-xs text-gray-400">Away</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full flex items-center justify-center border border-blue-600/50">
                      <span className="text-blue-300 font-bold text-sm">EF</span>
                    </div>
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-lg border border-green-600/30">
                  <p className="text-lg font-bold text-green-300">Tomorrow</p>
                  <p className="text-gray-300">20:00 GMT</p>
                  <Badge className="mt-2 bg-green-600/30 text-green-300 border-green-600/50">
                    Premier League
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* League Position */}
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-blue-600/40 transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-blue-100 text-xl">League Position</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-600/30">
                    <p className="text-gray-400 text-sm">Position</p>
                    <p className="text-3xl font-bold text-blue-400">2nd</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-600/30">
                    <p className="text-gray-400 text-sm">Points</p>
                    <p className="text-2xl font-bold text-yellow-400">45</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games Remaining</span>
                    <span className="text-white font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goal Difference</span>
                    <span className="text-green-400 font-medium">+12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Fixtures */}
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-purple-600/40 transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-purple-100 text-xl">Upcoming Fixtures</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-600/30">
                    <div>
                      <span className="font-medium text-green-100">vs Elite FC</span>
                      <div className="text-xs text-gray-400">Premier League</div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-300 text-sm">Tomorrow</span>
                      <div className="text-xs text-gray-400">20:00</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-600/30">
                    <div>
                      <span className="font-medium text-green-100">vs Pro United</span>
                      <div className="text-xs text-gray-400">Cup Match</div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-300 text-sm">Sat</span>
                      <div className="text-xs text-gray-400">15:00</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-600/30">
                    <div>
                      <span className="font-medium text-green-100">vs Champions FC</span>
                      <div className="text-xs text-gray-400">Premier League</div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-300 text-sm">Wed</span>
                      <div className="text-xs text-gray-400">20:00</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance */}
          <Card className="mb-12 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                <CardTitle className="text-green-100 text-xl">Recent Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-600/30">
                  <div className="text-2xl font-bold text-green-400 mb-1">5</div>
                  <div className="text-gray-400 text-sm">Wins</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-600/30">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">2</div>
                  <div className="text-gray-400 text-sm">Draws</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg border border-red-600/30">
                  <div className="text-2xl font-bold text-red-400 mb-1">1</div>
                  <div className="text-gray-400 text-sm">Losses</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-600/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1">18</div>
                  <div className="text-gray-400 text-sm">Goals Scored</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Schedule */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-green-100 text-2xl">Full Schedule</CardTitle>
                </div>
                <Badge variant="outline" className="border-green-600/50 text-green-400 bg-green-600/20">
                  Season 2024
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MatchList />
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
