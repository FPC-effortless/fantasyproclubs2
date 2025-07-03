import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Database } from '@/types/database'
import { Player, Match } from '@/types/database'

export function useStats() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const getPlayerStats = async (playerId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
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

  const getTeamStats = async (teamId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getMatchStats = async (matchId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
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

  const updatePlayerStats = async (
    playerId: string,
    stats: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .update(stats)
        .eq('id', playerId)
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

  const updateMatchStats = async (
    matchId: string,
    stats: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('matches')
        .update(stats)
        .eq('id', matchId)
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

  const getTopScorers = async (limit = 10) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('goals', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getTopAssists = async (limit = 10) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('assists', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getTopPoints = async (limit = 10) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('points', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const calculatePlayerPoints = (player: Player) => {
    let points = 0

    // Goals
    points += player.goals * 4

    // Assists
    points += player.assists * 3

    // Clean sheets
    if (player.position === 'GK' || player.position === 'DEF') {
      points += player.clean_sheets * 4
    } else if (player.position === 'MID') {
      points += player.clean_sheets * 1
    }

    // Cards
    points -= player.yellow_cards * 1
    points -= player.red_cards * 3

    return points
  }

  return {
    loading,
    error,
    getPlayerStats,
    getTeamStats,
    getMatchStats,
    updatePlayerStats,
    updateMatchStats,
    getTopScorers,
    getTopAssists,
    getTopPoints,
    calculatePlayerPoints,
  }
} 
