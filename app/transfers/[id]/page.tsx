import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Transfer Details | EA FC Pro Clubs',
  description: 'View and manage individual player transfer details',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function TransferDetailsPage({ params }: { params: { id: string } }) {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Transfer Details</h1>
          <div className="bg-[#111111] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-[#00ff87]/20 rounded-full flex items-center justify-center text-3xl font-bold text-[#00ff87]">
                P
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#00ff87]">John Smith</h2>
                <p className="text-gray-400">Position: ST</p>
                <p className="text-gray-400">Current Club: FC Pro Stars</p>
                <p className="text-gray-400">Value: €12M</p>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <button className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors">
                Make Offer
              </button>
              <button className="px-4 py-2 border border-[#00ff87] text-[#00ff87] rounded-lg hover:bg-[#00ff87]/10 transition-colors">
                Message Club
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Transfer History</h3>
              <ul className="list-disc list-inside text-gray-400">
                <li>2023/24: Joined FC Pro Stars from Elite FC (€10M)</li>
                <li>2021/22: Joined Elite FC from United Pro (€7M)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 