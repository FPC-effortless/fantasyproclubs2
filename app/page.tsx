"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Bell, Clock, Trophy, Users, Target, ArrowRight } from "lucide-react"
import { MatchCard } from "@/components/match/match-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

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

// Add feature preview component
function FeaturePreviewSection() {
  const features = [
    {
      type: "fan",
      title: "Fantasy Football Fan",
      description: "Create fantasy teams, join leagues, and compete with friends",
      icon: Trophy,
      color: "from-blue-500 to-blue-600",
      benefits: ["Fantasy Team Management", "League Competitions", "Player Tracking", "Weekly Challenges"],
      cta: "Start as Fan"
    },
    {
      type: "player", 
      title: "Pro Club Player",
      description: "Track your performance, join teams, and showcase your skills",
      icon: Target,
      color: "from-green-500 to-green-600", 
      benefits: ["Performance Analytics", "Team Membership", "Career Tracking", "Match History"],
      cta: "Join as Player"
    },
    {
      type: "manager",
      title: "Team Manager",
      description: "Lead your squad, manage tactics, and organize competitions",
      icon: Users,
      color: "from-yellow-500 to-yellow-600",
      benefits: ["Team Management", "Squad Selection", "Match Organization", "Analytics Dashboard"],
      cta: "Manage Teams"
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/80 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent mb-4">
            Choose Your Path in Fantasy Pro Clubs
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Whether you&apos;re a fan, player, or manager - there&apos;s a perfect experience waiting for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.type} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 overflow-hidden group hover:border-green-600/40 hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color} mr-2`} />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/login">
                    <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group`}>
                      {feature.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-lg font-semibold text-green-100 mb-2">Already know what you want?</h3>
            <p className="text-gray-300 mb-4">Jump straight into the action with our streamlined registration</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all">
                  I have an account
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white transition-all duration-300 shadow-lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [featuredMatch, setFeaturedMatch] = useState<FeaturedMatch | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [favoriteClub, setFavoriteClub] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  
  const { supabase } = useSupabase()

  const loadPageData = async () => {
    try {
      setLoading(true)
      
      // Load data with individual error handling
      await Promise.allSettled([
        loadMatches().catch(err => console.error('Error loading matches:', err)),
        loadFeaturedMatch().catch(err => console.error('Error loading featured match:', err)),
        loadNews().catch(err => console.error('Error loading news:', err)),
        loadCompetitions().catch(err => console.error('Error loading competitions:', err))
      ])
    } catch (error: any) {
      console.error('Error loading page data:', error)
      toast({
        title: "Error",
        description: "Failed to load page data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      // Check authentication status
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      // Load page data
      await loadPageData()
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
      await loadPageData()
    }
  }, [supabase])

  useEffect(() => {
    // Get favorite club from localStorage
    const club = typeof window !== 'undefined' ? localStorage.getItem('favorite_club') : null
    setFavoriteClub(club)
    checkAuthAndLoadData()
  }, [checkAuthAndLoadData])

  const loadMatches = async () => {
    try {
      // First, get the featured competition
      const { data: featuredContent, error: featuredError } = await supabase
        .from('featured_content')
        .select('featured_competition_id')
        .single()

      if (featuredError && featuredError.code !== 'PGRST116') {
        console.error('Error loading featured competition:', featuredError)
        return
      }

      if (!featuredContent?.featured_competition_id) {
        console.log('No featured competition set')
        setMatches([])
        return
      }

      // Then fetch matches for the featured competition
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, 
          match_date, 
          status, 
          home_team_stats, 
          away_team_stats, 
          home_team:home_team_id (
            id,
            name,
            logo_url
          ),
          away_team:away_team_id (
            id,
            name,
            logo_url
          ),
          competition:competition_id (
            id,
            name
          )
        `)
        .eq('competition_id', featuredContent.featured_competition_id)
        .order('match_date', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading matches:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to load matches. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!data || data.length === 0) {
        console.log('No matches found for featured competition')
        setMatches([])
        return
      }
      
      // Transform and validate the data
      const transformedMatches = data
        .filter((match: any) => {
          // Validate required fields
          if (!match.id || !match.match_date || !match.status) {
            console.warn('Match missing required fields:', match)
            return false
          }
          return true
        })
        .map((match: any) => {
          // Ensure all required fields are present with fallbacks
          const homeTeam = match.home_team?.[0] || match.home_team
          const awayTeam = match.away_team?.[0] || match.away_team
          const competition = match.competition?.[0] || match.competition

          if (!homeTeam?.id || !awayTeam?.id || !competition?.id) {
            console.warn('Match missing team or competition data:', match)
            return null
          }

          return {
            id: match.id,
            match_date: match.match_date,
            status: match.status,
            home_team_stats: match.home_team_stats || {},
            away_team_stats: match.away_team_stats || {},
            home_team: {
              id: homeTeam.id,
              name: homeTeam.name || 'Unknown Team',
              logo_url: homeTeam.logo_url ?? null
            },
            away_team: {
              id: awayTeam.id,
              name: awayTeam.name || 'Unknown Team',
              logo_url: awayTeam.logo_url ?? null
            },
            competition: {
              name: competition.name || 'Unknown Competition',
              logo_url: competition.logo_url ?? null
            }
          } as Match
        })
        .filter((match): match is Match => match !== null)
      
      setMatches(transformedMatches)
    } catch (error: any) {
      console.error('Unexpected error loading matches:', {
        message: error.message,
        stack: error.stack
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading matches.",
        variant: "destructive",
      })
    }
  }

  const loadFeaturedMatch = async () => {
    const { data, error } = await supabase
      .from('featured_matches')
      .select('id, title, description, image_url, match_id')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading featured match:', error)
      return
    }
    
    if (data) {
      // Create a simplified featured match without complex joins
      setFeaturedMatch({
        id: data.id,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        match: {
          id: data.match_id || '',
          match_date: new Date().toISOString(),
          status: 'scheduled',
          home_team: {
            id: '1',
            name: 'Home Team',
            logo_url: null
          },
          away_team: {
            id: '2',
            name: 'Away Team',
            logo_url: null
          },
          home_team_stats: {},
          away_team_stats: {},
          competition: {
            name: 'Pro Clubs League',
            logo_url: null
          }
        }
      })
    }
  }

  const loadNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, content, image_url, category, slug, published_at')
      .order('published_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error loading news:', error)
      return
    }
    setNews(data || [])
  }

  const loadCompetitions = async () => {
    try {
      console.log('Loading featured competition...')
      
      const { data: featuredContent, error: featuredError } = await supabase
        .from('featured_content')
        .select('featured_competition_id')
        .single()

      if (featuredError && featuredError.code !== 'PGRST116') {
        console.error('Error loading featured competition:', featuredError)
        return
      }

      if (!featuredContent?.featured_competition_id) {
        console.log('No featured competition set')
        setCompetitions([])
        return
      }

      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .eq('id', featuredContent.featured_competition_id)
        .single()

      if (error) {
        console.error('Error loading featured competition:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return
      }

      console.log('Featured competition loaded successfully')
      setCompetitions(data ? [data] : [])
    } catch (error: any) {
      console.error('Unexpected error loading featured competition:', error)
    }
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return {
        date: 'Today',
        time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      }
    }
    
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  // Personalize news: prioritize articles about favorite club
  const personalizedNews = favoriteClub
    ? [
        ...news.filter(article =>
          article.title.toLowerCase().includes(favoriteClub.replace(/[^a-z]/gi, '').toLowerCase()) ||
          (article.content && article.content.toLowerCase().includes(favoriteClub.replace(/[^a-z]/gi, '').toLowerCase()))
        ),
        ...news.filter(article =>
          !article.title.toLowerCase().includes(favoriteClub.replace(/[^a-z]/gi, '').toLowerCase()) &&
          !(article.content && article.content.toLowerCase().includes(favoriteClub.replace(/[^a-z]/gi, '').toLowerCase()))
        )
      ]
    : news

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16">
        <header className="sticky top-0 z-50 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 px-4 py-3 sm:p-4 flex items-center justify-between shadow-lg">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">Fantasy Pro Clubs</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-green-700/30 rounded-lg transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-700/30 rounded-lg transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-56 w-full rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700" />
          <Skeleton className="h-24 w-full rounded-xl bg-gradient-to-r from-gray-800 to-gray-700" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl bg-gradient-to-r from-gray-800 to-gray-700" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16">
      {/* [UNIFIED UI] Modern header and background, matching /competitions */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 px-4 py-3 sm:p-4 flex items-center justify-between shadow-lg">
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent truncate">Fantasy Pro Clubs</h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="p-2 hover:bg-green-700/30 rounded-lg transition-colors" aria-label="Search">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="p-2 hover:bg-green-700/30 rounded-lg transition-colors" aria-label="Notifications">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Welcome information for unauthenticated users */}
      {isAuthenticated === false && <FeaturePreviewSection />}

      {/* [UNIFIED UI] Competition search and horizontal scrollable list (if multiple competitions) */}
      {competitions.length > 1 && (
        <div className="mb-6 animate-in fade-in slide-in-from-top" style={{animationDelay: '100ms'}}>
          <div className="relative max-w-4xl mx-auto px-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search competitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          <div className="mt-4">
            <ScrollArea className="w-full whitespace-nowrap rounded-xl">
              <div className="flex spacing-md pb-4">
                {competitions
                  .filter(comp =>
                    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    comp.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((competition) => (
                    <button
                      key={competition.id}
                      onClick={() => setSelectedCompetition(competition.id)}
                      className={cn(
                        "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border rounded-xl p-6 min-w-[240px] text-left transition-all duration-300 ease-out btn-enhanced card-interactive",
                        selectedCompetition === competition.id
                          ? "border-green-600/60 bg-gradient-to-br from-green-900/30 to-gray-900/40 shadow-lg shadow-green-500/20"
                          : "border-gray-700/30 card-subtle-hover"
                      )}
                    >
                      <div className="flex items-center spacing-sm mb-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                          selectedCompetition === competition.id
                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        )}>
                          {competition.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "text-body-emphasis truncate",
                            selectedCompetition === competition.id ? "text-green-100" : "text-white"
                          )}>
                            {competition.name}
                          </h3>
                          <div className="flex items-center spacing-xs">
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-caption px-2 py-1",
                                selectedCompetition === competition.id 
                                  ? "bg-green-600/20 text-green-300 border-green-500/30" 
                                  : "bg-gray-700/50 text-gray-300"
                              )}
                            >
                              {competition.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-caption px-2 py-1",
                                competition.status === 'active' ? "border-green-500/30 text-green-400" :
                                competition.status === 'upcoming' ? "border-yellow-500/30 text-yellow-400" :
                                "border-gray-500/30 text-gray-400"
                              )}
                            >
                              {competition.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Enhanced Mobile-Responsive Featured Match Banner */}
      {featuredMatch ? (
        <div className="relative overflow-hidden">
          <Image
            src={featuredMatch.image_url || "/placeholder.jpg"}
            alt={featuredMatch.title}
            width={800}
            height={400}
            className="w-full h-48 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg">{featuredMatch.title}</h2>
            <p className="text-green-100 text-sm sm:text-base leading-relaxed">{featuredMatch.description}</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center border-b border-gray-700/50">
            <div className="text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/30 rounded-full"></div>
              </div>
              <p className="text-gray-400 text-base sm:text-lg">No featured match available</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile-Responsive Lineup Notice */}
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 backdrop-blur-sm border-y border-green-700/20 p-4 sm:p-5 flex items-center space-x-3 sm:space-x-4">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50 flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-bold text-green-100 text-base sm:text-lg">LINEUP AVAILABLE</h3>
          <p className="text-green-200/80 text-sm sm:text-base">Check your upcoming matches</p>
        </div>
      </div>

      {/* Enhanced Mobile-Responsive Tabs */}
      <Tabs defaultValue="fixtures" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-gray-700/50 px-4 sm:px-6">
          <TabsTrigger 
            value="fixtures"
            className="data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400 data-[state=active]:bg-green-900/20 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all hover:text-green-300"
          >
            Fixtures
          </TabsTrigger>
          <TabsTrigger 
            value="table"
            className="data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400 data-[state=active]:bg-green-900/20 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all hover:text-green-300"
          >
            League Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures" className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Featured Competition Header */}
            {competitions.length > 0 && (
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-green-900/40 to-green-800/30 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-green-700/30">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-lg flex-shrink-0">
                    {competitions[0].name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-green-100 truncate">{competitions[0].name}</h2>
                    <p className="text-green-300/80 text-xs sm:text-sm">Featured Competition</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Fixtures List */}
            {matches.length > 0 ? (
              <>
                {matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    compact={true}
                    showCompetition={false}
                  />
                ))}
                <Link href="/competitions/fixtures" className="block">
                  <button className="w-full text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/30">
                    See More Fixtures
                  </button>
                </Link>
              </>
            ) : (
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 shadow-xl">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-600/50 rounded-full"></div>
                  </div>
                  <p className="text-gray-400 text-lg">No fixtures available</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="table" className="p-4 sm:p-6 max-w-4xl mx-auto">
          {competitions.length > 0 ? (
            <div className="space-y-4">
              {/* Featured Competition Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-green-900/40 to-green-800/30 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-green-700/30">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-lg flex-shrink-0">
                    {competitions[0].name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-green-100 truncate">{competitions[0].name}</h2>
                    <p className="text-green-300/80 text-xs sm:text-sm">League Table</p>
                  </div>
                </div>
              </div>

              {/* League Table */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 shadow-xl overflow-hidden">
                {/* Mobile scroll hint */}
                <div className="block sm:hidden px-4 py-2 bg-green-900/20 border-b border-green-700/30">
                  <p className="text-xs text-green-300/80 text-center">← Scroll horizontally to view all stats →</p>
                </div>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800">
                  <table className="w-full" style={{ minWidth: '600px' }}>
                    <thead className="bg-gradient-to-r from-green-900/30 to-green-800/20">
                      <tr className="text-left">
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-xs sm:text-sm">#</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-xs sm:text-sm">Team</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">P</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">W</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">D</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">L</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">GF</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">GA</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">GD</th>
                        <th className="p-2 sm:p-4 text-green-100 font-semibold text-center text-xs sm:text-sm">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample table data - this will be replaced with real data from your database */}
                      {[
                        { pos: 1, team: "Manchester United FC", p: 12, w: 9, d: 2, l: 1, gf: 28, ga: 8, gd: 20, pts: 29 },
                        { pos: 2, team: "Liverpool FC", p: 12, w: 8, d: 3, l: 1, gf: 25, ga: 10, gd: 15, pts: 27 },
                        { pos: 3, team: "Arsenal FC", p: 12, w: 7, d: 4, l: 1, gf: 22, ga: 12, gd: 10, pts: 25 },
                        { pos: 4, team: "Chelsea FC", p: 12, w: 6, d: 5, l: 1, gf: 18, ga: 14, gd: 4, pts: 23 },
                        { pos: 5, team: "Tottenham Hotspur", p: 12, w: 5, d: 4, l: 3, gf: 20, ga: 16, gd: 4, pts: 19 },
                      ].map((team, index) => (
                        <tr key={index} className={`border-b border-gray-700/30 hover:bg-green-900/10 transition-colors ${
                          index === 0 ? 'bg-green-900/20' : index < 4 ? 'bg-blue-900/10' : ''
                        }`}>
                          <td className="p-2 sm:p-4">
                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' : index < 4 ? 'bg-blue-500 text-white' : 'text-gray-400'
                            }`}>
                              {team.pos}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <Image
                                src="/placeholder-logo.png"
                                alt={team.team}
                                width={20}
                                height={20}
                                className="rounded-full border border-gray-600 flex-shrink-0 sm:w-6 sm:h-6"
                              />
                              <span className="font-medium text-white text-xs sm:text-sm truncate">{team.team}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4 text-center text-gray-300 text-xs sm:text-sm">{team.p}</td>
                          <td className="p-2 sm:p-4 text-center text-green-400 text-xs sm:text-sm">{team.w}</td>
                          <td className="p-2 sm:p-4 text-center text-yellow-400 text-xs sm:text-sm">{team.d}</td>
                          <td className="p-2 sm:p-4 text-center text-red-400 text-xs sm:text-sm">{team.l}</td>
                          <td className="p-2 sm:p-4 text-center text-gray-300 text-xs sm:text-sm">{team.gf}</td>
                          <td className="p-2 sm:p-4 text-center text-gray-300 text-xs sm:text-sm">{team.ga}</td>
                          <td className="p-2 sm:p-4 text-center text-gray-300 text-xs sm:text-sm">{team.gd > 0 ? '+' : ''}{team.gd}</td>
                          <td className="p-2 sm:p-4 text-center font-bold text-green-400 text-xs sm:text-sm">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 shadow-xl">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500/30 rounded-full"></div>
                </div>
                <p className="text-gray-400 text-lg">No competition data available</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Latest News */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">Latest News</h2>
          <Link href="/videos" className="text-sm bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 bg-clip-text text-transparent font-medium transition-all">
            Latest Videos →
          </Link>
        </div>

        <div className="space-y-6">
          {personalizedNews.length > 0 ? (
            personalizedNews.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="block group">
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 overflow-hidden hover:border-green-600/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-900/20">
                  {article.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <div className="w-6 h-6 bg-green-500/30 rounded-full"></div>
                        </div>
                        <p className="text-gray-400">No image available</p>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-3 text-white group-hover:text-green-300 transition-colors">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                      <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full font-medium">{article.category}</span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTimeAgo(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 shadow-xl">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500/30 rounded-full"></div>
                </div>
                <p className="text-gray-400 text-lg">No news articles available</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
