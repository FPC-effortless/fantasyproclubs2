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
