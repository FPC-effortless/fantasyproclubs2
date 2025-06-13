import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Messages | Fantasy Pro Clubs',
  description: 'View and send messages to your friends',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function MessagesPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Messages</h1>
          <div className="bg-[#111111] rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Conversation</h2>
            <div className="h-64 overflow-y-auto flex flex-col gap-4 mb-4">
              {/* Example messages */}
              <div className="self-start bg-[#00ff87]/20 text-[#00ff87] px-4 py-2 rounded-lg max-w-xs">Hey, are you playing tonight?</div>
              <div className="self-end bg-[#00ff87] text-black px-4 py-2 rounded-lg max-w-xs">Yes! See you at 8pm.</div>
              <div className="self-start bg-[#00ff87]/20 text-[#00ff87] px-4 py-2 rounded-lg max-w-xs">Great, let&apos;s win this!</div>
            </div>
            <form className="flex gap-2">
              <input type="text" placeholder="Type your message..." className="flex-1 px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" />
              <button type="submit" className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors font-semibold">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
