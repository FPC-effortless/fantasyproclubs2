import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, ExternalLink, Newspaper, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: 'News | Fantasy Pro Clubs',
  description: 'Latest news and updates from the app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

const newsList = [
  { 
    id: 'season-2024', 
    title: 'Season 2024 Kicks Off!', 
    date: '2024-06-01', 
    summary: 'The new season is underway with exciting matches and new features.',
    category: 'Season Update',
    featured: true
  },
  { 
    id: 'transfer-market', 
    title: 'Transfer Market Now Open', 
    date: '2024-05-28', 
    summary: 'Clubs can now buy and sell players in the revamped transfer market.',
    category: 'Feature',
    featured: false
  },
  { 
    id: 'app-update', 
    title: 'App Update: New Features', 
    date: '2024-05-20', 
    summary: 'We have added new social features and improved the match experience.',
    category: 'Update',
    featured: false
  },
  {
    id: 'tournament-announcement',
    title: 'Pro Clubs World Championship',
    date: '2024-05-15',
    summary: 'Registration opens for the biggest Pro Clubs tournament of the year.',
    category: 'Tournament',
    featured: true
  }
]

export default function NewsPage() {
  const featuredNews = newsList.filter(news => news.featured)
  const regularNews = newsList.filter(news => !news.featured)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Season Update':
        return 'border-green-400/50 text-green-400 bg-green-400/20'
      case 'Feature':
        return 'border-blue-400/50 text-blue-400 bg-blue-400/20'
      case 'Update':
        return 'border-purple-400/50 text-purple-400 bg-purple-400/20'
      case 'Tournament':
        return 'border-yellow-400/50 text-yellow-400 bg-yellow-400/20'
      default:
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        {/* Enhanced Header */}
        <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  NEWS & UPDATES
                </h1>
                <p className="text-green-200/80">Stay up to date with the latest Fantasy Pro Clubs news</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Featured News */}
          {featuredNews.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-green-100">Featured Stories</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredNews.map((news) => (
                  <Card key={news.id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={getCategoryColor(news.category)}>
                          {news.category}
                        </Badge>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(news.date).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-green-100 text-xl group-hover:text-green-300 transition-colors">
                        {news.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 leading-relaxed">{news.summary}</p>
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                      >
                        <Link href={`/news/${news.id}`} className="inline-flex items-center justify-center gap-2">
                          <span>Read Full Story</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent News */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-green-100">Recent Updates</h2>
            </div>
            <div className="space-y-6">
              {regularNews.map((news) => (
                <Card key={news.id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="w-full md:w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-600/30">
                        <Newspaper className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <Badge variant="outline" className={getCategoryColor(news.category)}>
                            {news.category}
                          </Badge>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(news.date).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-green-100 group-hover:text-green-300 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-300">{news.summary}</p>
                      </div>
                      <Button 
                        asChild
                        variant="outline"
                        className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500 whitespace-nowrap"
                      >
                        <Link href={`/news/${news.id}`} className="inline-flex items-center gap-2">
                          <span>Read More</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <Card className="mt-12 bg-gradient-to-br from-green-800/20 to-green-900/20 backdrop-blur-sm border border-green-700/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-100 mb-2">Stay In The Loop</h3>
              <p className="text-gray-300 mb-6">Get the latest news and updates delivered straight to your inbox</p>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                Subscribe to Newsletter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
