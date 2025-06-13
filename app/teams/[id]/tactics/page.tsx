import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Team Tactics | EA FC Pro Clubs',
  description: 'Manage your team formation, tactics, and player instructions',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function TeamTacticsPage({ params }: { params: { id: string } }) {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#00ff87]">Team Tactics</h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors">
                Save Tactics
              </button>
              <button className="px-4 py-2 border border-[#00ff87] text-[#00ff87] rounded-lg hover:bg-[#00ff87]/10 transition-colors">
                Load Preset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formation and Tactics */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Formation & Tactics</h2>
                
                {/* Formation Display */}
                <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] rounded-lg mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full p-8">
                      {/* Football Field Layout */}
                      <div className="w-full h-full border-2 border-[#00ff87]/30 rounded-lg relative">
                        {/* Players */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">ST</span>
                        </div>
                        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">LW</span>
                        </div>
                        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">RW</span>
                        </div>
                        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">CM</span>
                        </div>
                        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">CM</span>
                        </div>
                        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">CM</span>
                        </div>
                        <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">LB</span>
                        </div>
                        <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">CB</span>
                        </div>
                        <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">RB</span>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">GK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactical Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Defensive Style</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="defensive-style" className="block text-sm text-gray-400 mb-2">Defensive Style</label>
                        <select 
                          id="defensive-style"
                          name="defensive-style"
                          aria-label="Select defensive style"
                          className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2"
                        >
                          <option>Balanced</option>
                          <option>Pressure on Heavy Touch</option>
                          <option>Pressure on Possession Loss</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="defensive-width" className="block text-sm text-gray-400 mb-2">Defensive Width</label>
                        <input 
                          id="defensive-width"
                          name="defensive-width"
                          type="range" 
                          min="1" 
                          max="10" 
                          aria-label="Adjust defensive width"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label htmlFor="defensive-depth" className="block text-sm text-gray-400 mb-2">Defensive Depth</label>
                        <input 
                          id="defensive-depth"
                          name="defensive-depth"
                          type="range" 
                          min="1" 
                          max="10" 
                          aria-label="Adjust defensive depth"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Attacking Style</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="build-up-play" className="block text-sm text-gray-400 mb-2">Build Up Play</label>
                        <select 
                          id="build-up-play"
                          name="build-up-play"
                          aria-label="Select build up play style"
                          className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2"
                        >
                          <option>Balanced</option>
                          <option>Long Ball</option>
                          <option>Possession</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="attacking-width" className="block text-sm text-gray-400 mb-2">Attacking Width</label>
                        <input 
                          id="attacking-width"
                          name="attacking-width"
                          type="range" 
                          min="1" 
                          max="10" 
                          aria-label="Adjust attacking width"
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label htmlFor="players-in-box" className="block text-sm text-gray-400 mb-2">Players in Box</label>
                        <input 
                          id="players-in-box"
                          name="players-in-box"
                          type="range" 
                          min="1" 
                          max="10" 
                          aria-label="Adjust number of players in box"
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Instructions */}
            <div>
              <div className="bg-[#111111] rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Player Instructions</h2>
                <div className="space-y-6">
                  {[
                    { position: 'ST', name: 'John Smith', instructions: ['Stay Central', 'Get in Behind'] },
                    { position: 'LW', name: 'Mike Johnson', instructions: ['Cut Inside', 'Get in Behind'] },
                    { position: 'RW', name: 'David Brown', instructions: ['Stay Wide', 'Come Short'] },
                    { position: 'CM', name: 'James Wilson', instructions: ['Stay Back', 'Cover Center'] },
                  ].map((player, index) => (
                    <div key={index} className="border-b border-gray-800 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00ff87]">{player.position}</span>
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {player.instructions.map((instruction, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-sm bg-[#1a1a1a] rounded-full text-[#00ff87]"
                          >
                            {instruction}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 