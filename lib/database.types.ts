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
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'league' | 'cup' | 'friendly' | 'swiss'
          status: 'upcoming' | 'active' | 'completed'
          start_date: string
          end_date: string | null
          fantasy_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'league' | 'cup' | 'friendly' | 'swiss'
          status?: 'upcoming' | 'active' | 'completed'
          start_date?: string
          end_date?: string | null
          fantasy_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'league' | 'cup' | 'friendly' | 'swiss'
          status?: 'upcoming' | 'active' | 'completed'
          start_date?: string
          end_date?: string | null
          fantasy_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      competition_teams: {
        Row: {
          id: string
          competition_id: string
          team_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          team_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          team_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          user_id: string
          team_id: string
          position: 'GK' | 'DEF' | 'MID' | 'FWD'
          number: number
          name: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          position: 'GK' | 'DEF' | 'MID' | 'FWD'
          number: number
          name: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          position?: 'GK' | 'DEF' | 'MID' | 'FWD'
          number?: number
          name?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      player_match_stats: {
        Row: {
          id: string
          match_id: string
          player_id: string
          competition_id: string
          team_id: string
          goals: number
          assists: number
          minutes_played: number
          rating: number
          clean_sheet: boolean
          saves: number
          penalty_saves: number
          own_goals: number
          penalty_misses: number
          yellow_cards: number
          red_cards: number
          motm: boolean
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          competition_id: string
          team_id: string
          goals?: number
          assists?: number
          minutes_played?: number
          rating?: number
          clean_sheet?: boolean
          saves?: number
          penalty_saves?: number
          own_goals?: number
          penalty_misses?: number
          yellow_cards?: number
          red_cards?: number
          motm?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          competition_id?: string
          team_id?: string
          goals?: number
          assists?: number
          minutes_played?: number
          rating?: number
          clean_sheet?: boolean
          saves?: number
          penalty_saves?: number
          own_goals?: number
          penalty_misses?: number
          yellow_cards?: number
          red_cards?: number
          motm?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      fantasy_player_stats: {
        Row: {
          id: string
          player_id: string
          competition_id: string
          fantasy_points: number
          fantasy_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          competition_id: string
          fantasy_points?: number
          fantasy_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          competition_id?: string
          fantasy_points?: number
          fantasy_price?: number
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
