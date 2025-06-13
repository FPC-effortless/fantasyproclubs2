import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Game Rules | Fantasy Pro Clubs',
  description: 'Official rules and fair play guidelines',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RulesPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Game Rules & Guidelines</h1>
          <div className="bg-[#111111] rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">1. Fair Play</h2>
              <p className="text-gray-300">Respect all players and officials. Unsportsmanlike conduct, cheating, or abuse will not be tolerated.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">2. Team Management</h2>
              <p className="text-gray-300">Managers are responsible for team lineups, tactics, and ensuring all players are registered and eligible.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">3. Match Conduct</h2>
              <p className="text-gray-300">Arrive on time for matches. Repeated no-shows may result in penalties or removal from the league.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">4. Transfers</h2>
              <p className="text-gray-300">All transfers must be approved by both clubs and the league. Unauthorized transfers are not permitted.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">5. Reporting Issues</h2>
              <p className="text-gray-300">Report any issues or disputes to league officials through the Contact Support page.</p>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
