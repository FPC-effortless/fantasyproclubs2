import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'League Statistics | EA FC Pro Clubs',
  description: 'View league statistics, top scorers, and more',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default async function LeagueStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">League Statistics</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Top Scorers</h2>
              <div className="space-y-2">
                {[
                  { name: 'John Smith', team: 'FC Pro Stars', goals: 15 },
                  { name: 'Mike Johnson', team: 'Elite FC', goals: 13 },
                  { name: 'David Brown', team: 'Champions FC', goals: 12 },
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#00ff87]">{player.name[0]}</span>
                      </div>
                      <span>{player.name}</span>
                      <span className="text-gray-400 text-sm">({player.team})</span>
                    </div>
                    <span className="font-bold">{player.goals}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Top Assists</h2>
              <div className="space-y-2">
                {[
                  { name: 'James Wilson', team: 'FC Pro Stars', assists: 10 },
                  { name: 'Alex Thompson', team: 'Elite FC', assists: 9 },
                  { name: 'Chris Evans', team: 'Champions FC', assists: 8 },
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#00ff87]">{player.name[0]}</span>
                      </div>
                      <span>{player.name}</span>
                      <span className="text-gray-400 text-sm">({player.team})</span>
                    </div>
                    <span className="font-bold">{player.assists}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-[#111111] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Defensive Stats</h2>
            <div className="space-y-2">
              {[
                { name: 'David Brown', team: 'Champions FC', cleanSheets: 8 },
                { name: 'Mike Johnson', team: 'Elite FC', cleanSheets: 7 },
                { name: 'John Smith', team: 'FC Pro Stars', cleanSheets: 6 },
              ].map((player, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#00ff87]">{player.name[0]}</span>
                    </div>
                    <span>{player.name}</span>
                    <span className="text-gray-400 text-sm">({player.team})</span>
                  </div>
                  <span className="font-bold">{player.cleanSheets}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 