import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Contact Support | Fantasy Pro Clubs',
  description: 'Get help or report an issue to support',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function ContactSupportPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Contact Support</h1>
          <div className="bg-[#111111] rounded-xl p-6">
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2">Your Email</label>
                <input id="email" name="email" type="email" className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2">Subject</label>
                <input id="subject" name="subject" type="text" className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2">Message</label>
                <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors font-semibold">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
