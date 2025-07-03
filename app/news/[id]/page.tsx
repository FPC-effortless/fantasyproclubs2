import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'

export const metadata: Metadata = {
  title: 'News Article | EA FC Pro Clubs',
  description: 'Read the latest news and updates',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const newsList = [
  { id: 'season-2024', title: 'Season 2024 Kicks Off!', date: '2024-06-01', summary: 'The new season is underway with exciting matches and new features.', content: [
    'The new season is underway with exciting matches and new features. Clubs are ready to compete for the title, and fans can expect thrilling action every week.',
    'We have introduced several improvements to the app, including enhanced match stats, a revamped transfer market, and new social features to connect with friends and teammates.',
    'Stay tuned for more updates and enjoy the new season!'
  ] },
  { id: 'transfer-market', title: 'Transfer Market Now Open', date: '2024-05-28', summary: 'Clubs can now buy and sell players in the revamped transfer market.', content: [
    'The transfer market is now open! Clubs can buy and sell players to strengthen their squads for the upcoming season.',
    'Check out the new features in the transfer market, including improved search and offer management.',
    'Good luck to all clubs in finding their next star player!'
  ] },
  { id: 'app-update', title: 'App Update: New Features', date: '2024-05-20', summary: 'We have added new social features and improved the match experience.', content: [
    'We are excited to announce a major app update with new features and improvements.',
    'Social features have been enhanced, and the match experience is now more immersive than ever.',
    'Update your app to enjoy the latest changes!'
  ] },
]

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = newsList.find((n) => n.id === id) || newsList[0]
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#00ff87] mb-2">{article.title}</h1>
            <p className="text-gray-400 mb-4">{article.date}</p>
            <div className="w-full h-48 bg-[#00ff87]/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-5xl text-[#00ff87]">📰</span>
            </div>
            <div className="space-y-4 text-gray-300">
              {article.content.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <Link href="/news" className="px-4 py-2 bg-[#00ff87] text-black rounded-lg hover:bg-[#00cc6a] transition-colors font-semibold">
            Back to News
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  )
} 