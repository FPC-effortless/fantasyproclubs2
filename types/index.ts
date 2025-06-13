export interface Competition {
  id: string
  name: string
  type: string
  status: string
  start_date: string
  end_date: string
  max_teams: number
  is_fantasy_enabled: boolean
  teams_count?: number
  stream_link?: string
}

export interface Team {
  id: string
  name: string
  short_name: string
  logo_url?: string
}

export interface Match {
  id: string
  competition_id: string
  home_team: Team
  away_team: Team
  match_date: string
  home_score?: number
  away_score?: number
  status: string
  venue?: string
}

export interface FantasyTeam {
  id: string
  team_name: string
  total_points: number
  gameweek_points: number
  remaining_budget: number
  user: {
    username: string
    display_name?: string
  }
}

export interface UserProfile {
  id: string
  username: string
  display_name?: string
  email: string
  user_type: string
  xbox_gamertag?: string
  psn_id?: string
  preferred_platform?: 'xbox' | 'playstation' | 'both'
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  platform_verified: boolean
  avatar_url?: string
  bio?: string
}

export interface Player {
  id: number
  name: string
  team: string
  position: string
  price: number
  points: number
  selectedBy: number
  form: number
  predictedPoints: number
  isCaptain?: boolean
  isViceCaptain?: boolean
  isSubstituted?: boolean
}

export type NavigationTab = "home" | "competitions" | "fantasy" | "profile"
