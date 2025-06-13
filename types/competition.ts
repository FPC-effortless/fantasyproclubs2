export type CompetitionType = 'league' | 'cup'

export type CompetitionFrequency = 'weekly' | 'biweekly' | 'monthly'

export type MatchStatus = 'scheduled' | 'postponed' | 'completed' | 'cancelled'

export interface CompetitionSettings {
  id: string
  type: CompetitionType
  frequency: CompetitionFrequency
  startDate: string
  endDate: string
  numberOfTeams: number
  homeAndAway: boolean
  // Cup specific
  groupStage?: boolean
  numberOfGroups?: number
  teamsPerGroup?: number
  thirdPlacePlayoff?: boolean
}

export interface Team {
  id: string
  name: string
}

export interface Competition {
  id: string
  name: string
}

export interface Match {
  id: string
  competition_id: string
  home_team_id: string
  away_team_id: string
  home_score?: number
  away_score?: number
  match_date: string
  status: MatchStatus
  round?: number // For knockout stages
  group?: string // For group stages
  postponed_from?: string
  matchday?: number // For league and group stages
  home_team_stats?: Record<string, any>
  away_team_stats?: Record<string, any>
  // Joined data with different field names
  homeTeam?: Team
  awayTeam?: Team
  competition?: Competition
}

export interface Group {
  id: string
  name: string
  teams: string[] // Array of team IDs
}

export interface KnockoutBracket {
  id: string
  competition_id: string
  round: number
  matches: Match[]
}

export interface LeagueTable {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  position: number
} 
