import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'League Fixtures | EA FC Pro Clubs',
  description: 'View upcoming and past league fixtures',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function LeagueFixturesPage({ params }: { params: { id: string } }) {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">League Fixtures</h1>
          <div className="bg-[#111111] rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
            <div className="space-y-4">
              {[
                { date: '2024-06-10', home: 'FC Pro Stars', away: 'Elite FC', time: '20:00' },
                { date: '2024-06-13', home: 'Champions FC', away: 'FC Pro Stars', time: '19:00' },
                { date: '2024-06-17', home: 'FC Pro Stars', away: 'Pro United', time: '21:00' },
              ].map((match, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{match.home}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="font-medium">{match.away}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{match.date}</p>
                    <p className="font-medium">{match.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111111] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
            <div className="space-y-4">
              {[
                { date: '2024-06-01', home: 'FC Pro Stars', away: 'Champions FC', score: '2-1' },
                { date: '2024-05-28', home: 'Elite FC', away: 'FC Pro Stars', score: '1-3' },
                { date: '2024-05-25', home: 'Pro United', away: 'FC Pro Stars', score: '0-2' },
              ].map((match, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{match.home}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="font-medium">{match.away}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{match.date}</p>
                    <p className="font-medium">{match.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 