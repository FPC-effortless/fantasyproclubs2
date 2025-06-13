import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Team Squad | EA FC Pro Clubs',
  description: 'Manage your team squad, view player stats, and make transfers',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function TeamSquadPage({ params }: { params: { id: string } }) {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#00ff87]">Team Squad</h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors">
                Add Player
              </button>
              <button className="px-4 py-2 border border-[#00ff87] text-[#00ff87] rounded-lg hover:bg-[#00ff87]/10 transition-colors">
                Transfer Market
              </button>
            </div>
          </div>

          {/* Squad Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Squad Overview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Total Players</p>
                  <p className="text-lg">23</p>
                </div>
                <div>
                  <p className="text-gray-400">Average Rating</p>
                  <p className="text-lg">82</p>
                </div>
                <div>
                  <p className="text-gray-400">Team Value</p>
                  <p className="text-lg">€45M</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Formation</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Current Formation</p>
                  <p className="text-lg">4-3-3</p>
                </div>
                <div>
                  <p className="text-gray-400">Preferred Style</p>
                  <p className="text-lg">Possession</p>
                </div>
                <div>
                  <p className="text-gray-400">Team Chemistry</p>
                  <p className="text-lg">85%</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff87]"></span>
                  <p>John Doe joined the team</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff87]"></span>
                  <p>Mike Smith&apos;s contract renewed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <p>David Wilson left the team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Player List */}
          <div className="bg-[#111111] rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Players</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-4">Player</th>
                    <th className="pb-4">Position</th>
                    <th className="pb-4">Rating</th>
                    <th className="pb-4">Age</th>
                    <th className="pb-4">Contract</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    { name: 'John Smith', position: 'ST', rating: 85, age: 24, contract: '2025' },
                    { name: 'Mike Johnson', position: 'CM', rating: 83, age: 26, contract: '2024' },
                    { name: 'David Brown', position: 'CB', rating: 82, age: 28, contract: '2026' },
                    { name: 'James Wilson', position: 'GK', rating: 84, age: 25, contract: '2025' },
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
                      <td className="py-4">{player.rating}</td>
                      <td className="py-4">{player.age}</td>
                      <td className="py-4">Until {player.contract}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm bg-[#00ff87] text-black rounded hover:bg-[#00cc6a] transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm border border-[#00ff87] text-[#00ff87] rounded hover:bg-[#00ff87]/10 transition-colors">
                            Stats
                          </button>
                        </div>
                      </td>
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