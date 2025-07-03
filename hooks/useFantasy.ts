import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Database } from '@/types/database'
import { FantasyTeam, Player } from '@/types/database'

export function useFantasy() {
  const [fantasyTeams, setFantasyTeams] = useState<FantasyTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchFantasyTeams()

    // Subscribe to fantasy team changes
    const subscription = supabase
      .channel('fantasy_teams_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fantasy_teams',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFantasyTeams((prev) => [...prev, payload.new as FantasyTeam])
          } else if (payload.eventType === 'UPDATE') {
            setFantasyTeams((prev) =>
              prev.map((team) =>
                team.id === payload.new.id ? (payload.new as FantasyTeam) : team
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setFantasyTeams((prev) =>
              prev.filter((team) => team.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchFantasyTeams = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .select('*')
        .order('points', { ascending: false })

      if (error) throw error
      setFantasyTeams(data)
    } catch (error) {
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const getFantasyTeam = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createFantasyTeam = async (team: Omit<FantasyTeam, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .insert([team])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateFantasyTeam = async (
    id: string,
    updates: Partial<Omit<FantasyTeam, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteFantasyTeam = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('fantasy_teams')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserFantasyTeams = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('user_id', userId)
        .order('points', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getCompetitionFantasyTeams = async (competitionId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('competition_id', competitionId)
        .order('points', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getTopFantasyTeams = (limit = 10) => {
    return fantasyTeams
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limit)
  }

  return {
    fantasyTeams,
    loading,
    error,
    getFantasyTeam,
    createFantasyTeam,
    updateFantasyTeam,
    deleteFantasyTeam,
    getUserFantasyTeams,
    getCompetitionFantasyTeams,
    getTopFantasyTeams,
  }
} 
