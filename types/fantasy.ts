export interface UserProfile {
  id: string
  username: string
  display_name: string
}

export interface FantasyTeam {
  id: string
  name: string
  manager_id: string
  competition_id: string
  formation: string
  players: string[]
}

export interface Standing {
  id: string
  team_name: string
  manager_name: string
  points: number
  trend: number
}

export interface Player {
  id: string
  name: string
  position: string
  fantasy_price: number
  user_profile: {
    display_name: string
    username: string
  }
}

export interface Competition {
  id: string
  name: string
}

export interface Formation {
  name: string
  positions: {
    GK: number
    DEF: number
    MID: number
    FWD: number
  }
  description: string
} 