export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          short_name: string
          logo_url: string | null
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
          gaming: Json | null
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          logo_url?: string | null
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          gaming?: Json | null
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          logo_url?: string | null
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          gaming?: Json | null
        }
      }
      players: {
        Row: {
          id: string
          user_id: string
          team_id: string
          position: string
          number: number
          status: string
          goals: number
          assists: number
          clean_sheets: number
          yellow_cards: number
          red_cards: number
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          position: string
          number: number
          status?: string
          goals?: number
          assists?: number
          clean_sheets?: number
          yellow_cards?: number
          red_cards?: number
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          position?: string
          number?: number
          status?: string
          goals?: number
          assists?: number
          clean_sheets?: number
          yellow_cards?: number
          red_cards?: number
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          status: string
          start_date: string | null
          end_date: string | null
          max_teams: number | null
          entry_fee: number | null
          prize_pool: number | null
          rules: string | null
          stream_link: string | null
          logo_url: string | null
          country_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          max_teams?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          rules?: string | null
          stream_link?: string | null
          logo_url?: string | null
          country_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          max_teams?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          rules?: string | null
          stream_link?: string | null
          logo_url?: string | null
          country_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          competition_id: string | null
          home_team_id: string
          away_team_id: string
          status: string
          match_date: string | null
          home_score: number | null
          away_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id?: string | null
          home_team_id: string
          away_team_id: string
          status?: string
          match_date?: string | null
          home_score?: number | null
          away_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string | null
          home_team_id?: string
          away_team_id?: string
          status?: string
          match_date?: string | null
          home_score?: number | null
          away_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_type: string
          display_name: string | null
          username: string | null
          avatar_url: string | null
          bio: string | null
          gaming: Json | null
          stats: Json | null
          notifications: Json | null
          display: Json | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_type?: string
          display_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          gaming?: Json | null
          stats?: Json | null
          notifications?: Json | null
          display?: Json | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: string
          display_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          gaming?: Json | null
          stats?: Json | null
          notifications?: Json | null
          display?: Json | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      competition_teams: {
        Row: {
          id: string
          competition_id: string
          team_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          team_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          team_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      swiss_model_configs: {
        Row: {
          id: string
          competition_id: string
          number_of_teams: number
          matches_per_team: number
          same_country_restriction: boolean
          home_away_balance: boolean
          direct_qualifiers: number
          playoff_qualifiers: number
          tiebreakers: string[]
          exclusions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          number_of_teams: number
          matches_per_team: number
          same_country_restriction?: boolean
          home_away_balance?: boolean
          direct_qualifiers: number
          playoff_qualifiers: number
          tiebreakers?: string[]
          exclusions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          number_of_teams?: number
          matches_per_team?: number
          same_country_restriction?: boolean
          home_away_balance?: boolean
          direct_qualifiers?: number
          playoff_qualifiers?: number
          tiebreakers?: string[]
          exclusions?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export convenience types for easier imports
export type Tables = Database['public']['Tables']
export type User = Tables['user_profiles']['Row']
export type Team = Tables['teams']['Row']
export type Player = Tables['players']['Row']
export type Competition = Tables['competitions']['Row']
export type Match = Tables['matches']['Row']
export type CompetitionTeam = Tables['competition_teams']['Row']
export type SwissConfig = Tables['swiss_model_configs']['Row']

// Additional types that might be needed
export type UserInsert = Tables['user_profiles']['Insert']
export type TeamInsert = Tables['teams']['Insert']
export type PlayerInsert = Tables['players']['Insert']
export type CompetitionInsert = Tables['competitions']['Insert']
export type MatchInsert = Tables['matches']['Insert']

export type UserUpdate = Tables['user_profiles']['Update']
export type TeamUpdate = Tables['teams']['Update']
export type PlayerUpdate = Tables['players']['Update']
export type CompetitionUpdate = Tables['competitions']['Update']
export type MatchUpdate = Tables['matches']['Update']

// Fantasy and notification types (if they exist in the database)
// Note: These might need to be defined separately if they don't exist in the database
export interface FantasyTeam {
  id: string
  user_id: string
  competition_id?: string
  name: string
  formation: string
  points?: number
  budget?: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  created_at: string
}

export interface Transfer {
  id: string
  player_id: string
  from_team_id: string | null
  to_team_id: string
  transfer_date: string
  fee: number | null
  created_at: string
}

export interface Award {
  id: string
  name: string
  description: string
  type: string
  icon_url: string | null
  created_at: string
}
