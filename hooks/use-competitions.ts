"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Competition } from "@/types"

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const { data, error } = await supabase
          .from("competitions")
          .select("*")
          .order("start_date", { ascending: false })

        if (error) throw error
        setCompetitions(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  return { competitions, loading, error }
}
