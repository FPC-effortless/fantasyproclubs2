"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from '@/lib/supabase/client'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Clock, User, Star, Trophy, TrendingUp, Users, Target, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchCard } from "@/components/match/match-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FeaturePreviewSection } from '@/components/home/feature-preview'
import { MatchesSection } from '@/components/home/matches-section'
import { Loading } from '@/components/ui/loading'
import { NewsSection } from '@/components/home/news-section'
import { FeaturedMatchSection } from '@/components/home/featured-match-section'

interface Match {
  id: string
  match_date: string
  status: string
  home_team_stats: {
    goals?: number
  }
  away_team_stats: {
    goals?: number
  }
  home_team: {
    id: string
    name: string
    logo_url: string | null
  }
  away_team: {
    id: string
    name: string
    logo_url: string | null
  }
  competition: {
    name: string
    logo_url?: string | null
  }
}

interface FeaturedMatch {
  id: string
  title: string
  description: string
  image_url: string | null
  match: Match
}

interface NewsArticle {
  id: string
  title: string
  content: string | null
  image_url: string | null
  category: string
  slug: string
  published_at: string
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const supabase = createClient()

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <FeaturedMatchSection isAuthenticated={isAuthenticated} />
      <MatchesSection isAuthenticated={isAuthenticated} />
      <NewsSection isAuthenticated={isAuthenticated} />
      <FeaturePreviewSection />
    </main>
  )
}
