"use client"

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import Image from 'next/image'
import { CompetitionTable } from '../competition-table'

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  venue?: string
  competition: {
    id: string
    name: string
    type: string
  }
  home_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  away_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  match_events?: any[]
  match_stats?: any
}

interface MatchTableProps {
  match: Match
}

interface TeamStanding {
  position: number
  team_id: string
  team_name: string
  team_logo?: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
  isHomeTeam?: boolean
  isAwayTeam?: boolean
}

interface CompetitionInfo {
  total_matchdays: number
  current_matchday: number
  season: string
}

export function MatchTable({ match }: MatchTableProps) {
  return <CompetitionTable competitionId={match.competition.id} />
}