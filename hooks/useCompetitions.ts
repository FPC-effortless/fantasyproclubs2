import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Database } from '@/types/database'
import { Competition } from '@/types/database'

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchCompetitions()

    // Subscribe to competition changes
    const subscription = supabase
      .channel('competitions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competitions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCompetitions((prev) => [...prev, payload.new as Competition])
          } else if (payload.eventType === 'UPDATE') {
            setCompetitions((prev) =>
              prev.map((comp) =>
                comp.id === payload.new.id ? (payload.new as Competition) : comp
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCompetitions((prev) =>
              prev.filter((comp) => comp.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompetitions(data)
    } catch (error) {
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const getCompetition = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
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

  const createCompetition = async (competition: Omit<Competition, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
        .insert([competition])
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

  const updateCompetition = async (
    id: string,
    updates: Partial<Omit<Competition, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
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

  const deleteCompetition = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('competitions')
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

  const getActiveCompetitions = () => {
    return competitions.filter((comp) => comp.status === 'active')
  }

  const getUpcomingCompetitions = () => {
    return competitions.filter((comp) => comp.status === 'upcoming')
  }

  const getCompletedCompetitions = () => {
    return competitions.filter((comp) => comp.status === 'completed')
  }

  return {
    competitions,
    loading,
    error,
    getCompetition,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getActiveCompetitions,
    getUpcomingCompetitions,
    getCompletedCompetitions,
  }
} 
