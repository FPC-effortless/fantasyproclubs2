import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import {
  User,
  Team,
  Player,
  Competition,
  Match,
  FantasyTeam,
  Notification,
  Transfer,
  Award,
} from '@/types/database'
import { handleError } from "@/lib/errors"
import { ApiResponse, createSuccessResponse, createErrorResponse, ApiRequestConfig } from "@/lib/types/api"
import { toast } from "@/components/ui/use-toast"

const supabase = createClientComponentClient<Database>()

// User API
export const userApi = {
  async get<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  async update<T>(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(undefined)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  }
}

// Team API
export const teamApi = {
  async get<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  list: async () => {
    const { data, error } = await supabase.from('teams').select('*')
    if (error) throw error
    return data
  },

  create: async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update<T>(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) throw error
  },
}

// Player API
export const playerApi = {
  get: async (id: string) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  list: async () => {
    const { data, error } = await supabase.from('players').select('*')
    if (error) throw error
    return data
  },

  create: async (player: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) throw error
  }
}

// Competition API
export const competitionApi = {
  getCompetition: async (competitionId: string) => {
    const { data, error } = await supabase
      .from('competitions')
      .select(`
        *,
        matches:matches(*),
        teams:teams(*)
      `)
      .eq('id', competitionId)
      .single()
    if (error) throw error
    return data as Competition & { matches: Match[], teams: Team[] }
  },

  createCompetition: async (competitionData: Omit<Competition, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('competitions')
      .insert([competitionData])
      .select()
      .single()
    if (error) throw error
    return data as Competition
  },

  updateCompetition: async (competitionId: string, updates: Partial<Competition>) => {
    const { data, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', competitionId)
      .select()
      .single()
    if (error) throw error
    return data as Competition
  },

  deleteCompetition: async (competitionId: string) => {
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId)
    if (error) throw error
  },
}

// Match API
export const matchApi = {
  async get<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  createMatch: async (matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single()
    if (error) throw error
    return data as Match
  },

  async update<T>(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return createSuccessResponse(data as T)
    } catch (error) {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return createErrorResponse(appError.code, appError.message)
    }
  },

  deleteMatch: async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
    if (error) throw error
  },
}

// Fantasy Team API
export const fantasyTeamApi = {
  getFantasyTeam: async (fantasyTeamId: string) => {
    const { data, error } = await supabase
      .from('fantasy_teams')
      .select(`
        *,
        players:players(*),
        user:users(*),
        competition:competitions(*)
      `)
      .eq('id', fantasyTeamId)
      .single()
    if (error) throw error
    return data as FantasyTeam & {
      players: Player[],
      user: User,
      competition: Competition
    }
  },

  createFantasyTeam: async (fantasyTeamData: Omit<FantasyTeam, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('fantasy_teams')
      .insert([fantasyTeamData])
      .select()
      .single()
    if (error) throw error
    return data as FantasyTeam
  },

  updateFantasyTeam: async (fantasyTeamId: string, updates: Partial<FantasyTeam>) => {
    const { data, error } = await supabase
      .from('fantasy_teams')
      .update(updates)
      .eq('id', fantasyTeamId)
      .select()
      .single()
    if (error) throw error
    return data as FantasyTeam
  },

  deleteFantasyTeam: async (fantasyTeamId: string) => {
    const { error } = await supabase
      .from('fantasy_teams')
      .delete()
      .eq('id', fantasyTeamId)
    if (error) throw error
  }
}

// Notification API
export const notificationApi = {
  getNotification: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()
    if (error) throw error
    return data as Notification
  },

  createNotification: async (notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()
    if (error) throw error
    return data as Notification
  },

  updateNotification: async (notificationId: string, updates: Partial<Notification>) => {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', notificationId)
      .select()
      .single()
    if (error) throw error
    return data as Notification
  },

  deleteNotification: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    if (error) throw error
  }
}

// Transfer API
export const transferApi = {
  getTransfer: async (transferId: string) => {
    const { data, error } = await supabase
      .from('transfers')
      .select(`
        *,
        player:players(*),
        from_team:teams!transfers_from_team_id_fkey(*),
        to_team:teams!transfers_to_team_id_fkey(*)
      `)
      .eq('id', transferId)
      .single()
    if (error) throw error
    return data as Transfer & {
      player: Player,
      from_team: Team,
      to_team: Team
    }
  },

  createTransfer: async (transferData: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('transfers')
      .insert([transferData])
      .select()
      .single()
    if (error) throw error
    return data as Transfer
  },

  updateTransfer: async (transferId: string, updates: Partial<Transfer>) => {
    const { data, error } = await supabase
      .from('transfers')
      .update(updates)
      .eq('id', transferId)
      .select()
      .single()
    if (error) throw error
    return data as Transfer
  },

  deleteTransfer: async (transferId: string) => {
    const { error } = await supabase
      .from('transfers')
      .delete()
      .eq('id', transferId)
    if (error) throw error
  }
}

// Award API
export const awardApi = {
  getAward: async (awardId: string) => {
    const { data, error } = await supabase
      .from('awards')
      .select(`
        *,
        player:players(*),
        competition:competitions(*)
      `)
      .eq('id', awardId)
      .single()
    if (error) throw error
    return data as Award & {
      player: Player,
      competition: Competition
    }
  },

  createAward: async (awardData: Omit<Award, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('awards')
      .insert([awardData])
      .select()
      .single()
    if (error) throw error
    return data as Award
  },

  updateAward: async (awardId: string, updates: Partial<Award>) => {
    const { data, error } = await supabase
      .from('awards')
      .update(updates)
      .eq('id', awardId)
      .select()
      .single()
    if (error) throw error
    return data as Award
  },

  deleteAward: async (awardId: string) => {
    const { error } = await supabase
      .from('awards')
      .delete()
      .eq('id', awardId)
    if (error) throw error
  }
} 
