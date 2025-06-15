'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/match'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

interface NewsSectionProps {
  isAuthenticated: boolean | null
}

export function NewsSection({ isAuthenticated }: NewsSectionProps) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setNews(data || [])
    } catch (err) {
      console.error('Error loading news:', err)
      setError('Failed to load news. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => loadNews()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
            Latest News
          </h2>
          <Link href="/news">
            <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50">
              View All News
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.map((article) => (
            <Card 
              key={article.id}
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 overflow-hidden group hover:border-green-600/40 transition-all duration-300"
            >
              {article.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <Badge variant="secondary" className="mb-2">
                  {article.category}
                </Badge>
                <h3 className="text-xl font-bold text-green-100 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {article.content}
                </p>
                <Link href={`/news/${article.slug}`}>
                  <Button variant="ghost" className="text-green-400 hover:text-green-300">
                    Read More
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 