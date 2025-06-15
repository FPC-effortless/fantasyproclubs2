export interface Fixture {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  venue: string
  status: 'upcoming' | 'live' | 'completed'
  isHome?: boolean
  opponent?: string
  result?: string
}

export interface MatchResult {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  competition: string
  venue: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  events: MatchEvent[]
}

export interface MatchEvent {
  id: string
  type: "goal" | "assist" | "yellow_card" | "red_card" | "substitution"
  minute: number
  player: string
  team: string
  description?: string
}

export interface Team {
  id: string
  name: string
  logo_url: string | null
}

export interface TeamStats {
  goals?: number
  possession?: number
  shots?: number
  shots_on_target?: number
  corners?: number
  fouls?: number
  yellow_cards?: number
  red_cards?: number
}

export interface Competition {
  id: string
  name: string
  type: string
  status: string
  logo_url?: string | null
}

export interface Match {
  id: string
  match_date: string
  status: string
  home_team_stats: TeamStats
  away_team_stats: TeamStats
  home_team: Team
  away_team: Team
  competition: Competition
}

export interface FeaturedMatch {
  id: string
  title: string
  description: string
  image_url: string | null
  match: Match
}

export interface NewsArticle {
  id: string
  title: string
  content: string | null
  image_url: string | null
  category: string
  slug: string
  published_at: string
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'
export type CompetitionType = 'league' | 'cup' | 'friendly'
export type CompetitionStatus = 'active' | 'completed' | 'upcoming' 
