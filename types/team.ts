export type UserRole = "admin" | "manager" | "player" | "fan"

export interface TeamMember {
  id: string
  name: string
  position: string
  jerseyNumber: number
  avatar?: string
  role: "captain" | "player" | "manager"
  matchesPlayed: number
  goals: number
  assists: number
  rating: number
  status: "active" | "injured" | "suspended" | "inactive"
  stats: {
    matches: number
    goals: number
    assists: number
    rating: number
  }
  gaming: {
    xbox_gamertag?: string
    psn_id?: string
    preferred_platform: "xbox" | "playstation" | "both"
    experience_level: "beginner" | "intermediate" | "advanced" | "professional"
    platform_verified: boolean
  }
}

export interface Team {
  id: string
  name: string
  shortName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  foundedDate: string
  homeVenue: string
  founded: string
  stadium: string
  logo: string
  manager: {
    id: string
    name: string
    email: string
  }
  members: TeamMember[]
  stats: TeamPerformance
  gaming: {
    preferred_platform: "xbox" | "playstation" | "both"
    platform_requirements: {
      xbox_required: boolean
      psn_required: boolean
      min_experience: "beginner" | "intermediate" | "advanced" | "professional"
    }
    platform_stats: {
      xbox_players: number
      psn_players: number
      cross_platform_players: number
    }
  }
}

export interface TeamPerformance {
  matches: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  cleanSheets: number
  form: string[]
  recentMatches: {
    date: string
    opponent: string
    result: string
    venue: 'home' | 'away'
  }[]
  performance: {
    labels: string[]
    data: number[]
  }
  performanceOverTime: {
    date: string
    wins: number
    draws: number
    losses: number
  }[]
} 
