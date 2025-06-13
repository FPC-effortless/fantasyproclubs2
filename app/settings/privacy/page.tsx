import { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'Privacy Settings | Fantasy Pro Clubs',
  description: 'Manage your privacy and data sharing preferences',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function PrivacySettingsPage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff87] mb-8">Privacy Settings</h1>
          <div className="bg-[#111111] rounded-xl p-6">
            <form className="space-y-6">
              <div className="flex items-center justify-between">
                <label htmlFor="profile-visibility" className="text-lg">Public Profile</label>
                <input id="profile-visibility" name="profile-visibility" type="checkbox" className="w-5 h-5 accent-[#00ff87]" />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="show-stats" className="text-lg">Show Stats to Others</label>
                <input id="show-stats" name="show-stats" type="checkbox" className="w-5 h-5 accent-[#00ff87]" />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="share-data" className="text-lg">Allow Data Sharing</label>
                <input id="share-data" name="share-data" type="checkbox" className="w-5 h-5 accent-[#00ff87]" />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="email-updates" className="text-lg">Receive Email Updates</label>
                <input id="email-updates" name="email-updates" type="checkbox" className="w-5 h-5 accent-[#00ff87]" />
              </div>
              <button type="submit" className="mt-8 w-full px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors font-semibold">
                Save Privacy Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
