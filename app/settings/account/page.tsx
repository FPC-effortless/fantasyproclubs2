import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Account Settings | Fantasy Pro Clubs',
  description: 'Manage your account information and password',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function AccountSettingsPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Account Settings</h1>
          <div className="bg-[#111111] rounded-xl p-6 mb-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="username" className="block mb-2">Username</label>
                <input id="username" name="username" type="text" className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" defaultValue="profan123" />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <input id="email" name="email" type="email" className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" defaultValue="fan@email.com" />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2">New Password</label>
                <input id="password" name="password" type="password" className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-gray-800 text-white" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors font-semibold">
                Update Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
