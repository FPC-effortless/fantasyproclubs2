import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Transfer Offers | Fantasy Pro Clubs',
  description: 'View and manage transfer offers for your club',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function TransferOffersPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Transfer Offers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incoming Offers */}
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Incoming Offers</h2>
              <div className="space-y-4">
                {[
                  { player: 'John Smith', from: 'Elite FC', value: '€12M', status: 'Pending' },
                  { player: 'Mike Johnson', from: 'Champions FC', value: '€9M', status: 'Accepted' },
                ].map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                    <div>
                      <p className="font-medium">{offer.player}</p>
                      <p className="text-gray-400 text-sm">From: {offer.from}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00ff87] font-bold">{offer.value}</span>
                      <span className="text-xs text-gray-400">{offer.status}</span>
                      <button className="px-3 py-1 text-sm bg-[#00ff87] text-black rounded hover:bg-[#00cc6a] transition-colors">
                        Respond
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Outgoing Offers */}
            <div className="bg-[#111111] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Outgoing Offers</h2>
              <div className="space-y-4">
                {[
                  { player: 'David Brown', to: 'Pro United', value: '€8M', status: 'Pending' },
                  { player: 'James Wilson', to: 'United Pro', value: '€7M', status: 'Rejected' },
                ].map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                    <div>
                      <p className="font-medium">{offer.player}</p>
                      <p className="text-gray-400 text-sm">To: {offer.to}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00ff87] font-bold">{offer.value}</span>
                      <span className="text-xs text-gray-400">{offer.status}</span>
                      <button className="px-3 py-1 text-sm border border-[#00ff87] text-[#00ff87] rounded hover:bg-[#00ff87]/10 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
