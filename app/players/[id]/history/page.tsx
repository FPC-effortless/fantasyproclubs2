import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Player Match History | EA FC Pro Clubs',
  description: 'View player match history and recent performances',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default async function PlayerHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Match History</h1>
          <div className="space-y-4">
            {[
              { date: '2024-06-01', opponent: 'Elite FC', result: 'W 3-1', goals: 1, assists: 0, rating: 8.5 },
              { date: '2024-05-28', opponent: 'Pro United', result: 'W 2-0', goals: 0, assists: 1, rating: 7.9 },
              { date: '2024-05-25', opponent: 'Champions FC', result: 'L 1-2', goals: 1, assists: 0, rating: 8.1 },
              { date: '2024-05-20', opponent: 'United Pro', result: 'W 4-2', goals: 2, assists: 1, rating: 9.0 },
            ].map((match, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#111111] rounded-lg">
                <div>
                  <p className="font-medium">vs {match.opponent}</p>
                  <p className="text-gray-400 text-sm">{match.date}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold">{match.result}</p>
                    <p className="text-gray-400 text-xs">Result</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{match.goals}</p>
                    <p className="text-gray-400 text-xs">Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{match.assists}</p>
                    <p className="text-gray-400 text-xs">Assists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{match.rating}</p>
                    <p className="text-gray-400 text-xs">Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 