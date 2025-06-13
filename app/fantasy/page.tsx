"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Shirt, Users2, BarChart3, HelpCircle, Plus, Search, Trophy, X, Check, Crown, Settings } from "lucide-react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
// Fantasy formations defined inline to avoid import issues
const FANTASY_FORMATIONS = [
  {
    name: "4-4-2",
    positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    description: "Balanced formation with solid midfield"
  },
  {
    name: "4-3-3", 
    positions: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    description: "Attacking formation with wide forwards"
  },
  {
    name: "4-5-1",
    positions: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    description: "Defensive formation with packed midfield"
  },
  {
    name: "3-5-2",
    positions: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    description: "Modern formation with wing-backs"
  }
]

// Position to fantasy role mapping
const getFantasyRole = (position: string): 'GK' | 'DEF' | 'MID' | 'FWD' => {
  const pos = position.toUpperCase()
  if (pos === 'GK') return 'GK'
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF'
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MID'
  if (['LW', 'RW', 'ST', 'CF'].includes(pos)) return 'FWD'
  return 'MID' // default
}

// Formation validation
const isLineupValid = (lineup: any[], formationName: string): boolean => {
  const formation = FANTASY_FORMATIONS.find(f => f.name === formationName)
  if (!formation) return false
  
  const count = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  lineup.forEach(player => {
    const role = player.fantasyRole || getFantasyRole(player.position)
    if (role in count) count[role as keyof typeof count]++
  })
  
  return count.GK === formation.positions.GK &&
         count.DEF === formation.positions.DEF &&
         count.MID === formation.positions.MID &&
         count.FWD === formation.positions.FWD
}

interface UserProfile {
  id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  user_type: string
}

interface FantasyTeam {
  id: string
  name: string
  budget: number
  points: number
  user_id: string
}

interface CompetitionStanding {
  position: number
  team_name: string
  points: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
}

interface GameweekInfo {
  currentGameweek: number
  nextDeadline: string | null
  timeUntilDeadline: string | null
}

interface FantasyLeaderboardEntry {
  position: number
  user_id: string
  user_profile: {
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
  fantasy_team: {
    name: string
    points: number
  }
  team_name?: string // For club leaderboard
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
  fantasy_enabled: boolean
}

interface Player {
  id: string
  user_id: string
  position: string
  number: number
  status: string
  team_id: string
  fantasy_price: number
  fantasy_points: number
  is_manager?: boolean
  avatar_url?: string | null
  user_profile: {
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
  team: {
    id: string
    name: string
    short_name: string
    logo_url?: string | null
  }
}

interface SelectedPlayer {
  id: string
  name: string
  position: string
  fantasyRole: 'GK' | 'DEF' | 'MID' | 'FWD'
  team: string
  price: number
  points: number
  avatar_url: string | null
}



export default function FantasyPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fantasyTeam, setFantasyTeam] = useState<FantasyTeam | null>(null)
  const [standings, setStandings] = useState<CompetitionStanding[]>([])
  const [leagueLeaderboard, setLeagueLeaderboard] = useState<FantasyLeaderboardEntry[]>([])
  const [clubLeaderboard, setClubLeaderboard] = useState<FantasyLeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'league' | 'club'>('league')
  const [loading, setLoading] = useState(true)
  const [gameweekInfo, setGameweekInfo] = useState<GameweekInfo>({
    currentGameweek: 1,
    nextDeadline: null,
    timeUntilDeadline: null
  })
  const [gameweekStats, setGameweekStats] = useState({
    totw: 0,
    points: 0,
    highest: 0
  })

  // Team creation states
  const [showTeamCreation, setShowTeamCreation] = useState(false)
  const [fantasyCompetitions, setFantasyCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([])
  const [selectedFormation, setSelectedFormation] = useState(FANTASY_FORMATIONS[0])
  const [teamName, setTeamName] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [budget] = useState(100) // Fixed budget
  const [creatingTeam, setCreatingTeam] = useState(false)
  
  const { supabase } = useSupabase()

  useEffect(() => {
    loadFantasyData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userProfile && !fantasyTeam) {
      setShowTeamCreation(true)
      loadFantasyCompetitions()
    }
  }, [userProfile, fantasyTeam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCompetition) {
      loadPlayersForCompetition(selectedCompetition)
    }
  }, [selectedCompetition]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFantasyData = async () => {
    try {
      setLoading(true)
      
      if (!supabase) {
        console.log('Supabase not available - showing minimal fantasy page')
        setLoading(false)
        return
      }
      
      await Promise.all([
        loadUserProfile(),
        loadFantasyTeam(),
        loadStandings(),
        loadGameweekInfo()
      ])
      
      // Load leaderboards after user profile is loaded to determine user's team
      await Promise.all([
        loadLeagueLeaderboard(),
        loadClubLeaderboard()
      ])
    } catch (error: any) {
      console.error('Error loading fantasy data:', error)
      // Don't show error toast for auth issues - just log them
      if (!error?.message?.includes('Auth')) {
      toast({
        title: "Error",
        description: "Failed to load fantasy data. Please try again.",
        variant: "destructive",
      })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async () => {
    try {
      // Check if Supabase auth is available
      if (!supabase?.auth) {
        console.log('Supabase auth not available - showing public fantasy page')
        setUserProfile(null)
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Handle auth error gracefully - user might not be logged in
      if (userError || !user) {
        console.log('No authenticated user - showing public fantasy page')
        setUserProfile(null)
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, username, avatar_url, user_type')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        setUserProfile(null)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.log('Auth error - showing public fantasy page:', error)
      setUserProfile(null)
    }
  }

  const loadFantasyTeam = async () => {
    try {
      // Check if Supabase auth is available
      if (!supabase?.auth) {
        console.log('Supabase auth not available - cannot load fantasy team')
        setFantasyTeam(null)
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Handle auth error gracefully - user might not be logged in
      if (userError || !user) {
        console.log('No authenticated user - cannot load fantasy team')
        setFantasyTeam(null)
        return
      }

      const { data, error } = await supabase
        .from('fantasy_teams')
        .select('id, name, budget, points, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading fantasy team:', error)
        setFantasyTeam(null)
        return
      }

      if (data) {
        setFantasyTeam(data)
        // Generate some mock gameweek stats based on team points
        setGameweekStats({
          totw: Math.floor(data.points / 10),
          points: Math.max(0, data.points - 100),
          highest: data.points + Math.floor(Math.random() * 50)
        })
      }
    } catch (error) {
      console.log('Auth error - cannot load fantasy team:', error)
      setFantasyTeam(null)
    }
  }

  const loadStandings = async () => {
    try {
      console.log('Loading standings...')
      
      // First check if the required columns exist
      const { data: tableCheck, error: checkError } = await supabase
        .from('competition_teams')
        .select('*')
        .limit(1)

      console.log('Table structure:', tableCheck)

      if (checkError || !tableCheck) {
        console.error('Error checking table:', checkError)
        // Use helpful mock data that indicates migration is needed
        setStandings([
          { position: 1, team_name: "⚠️ Database Migration Required", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 2, team_name: "🔧 Run fix_database.sql", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 3, team_name: "📋 In Supabase SQL Editor", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 }
        ])
        return
      }

      // Check if required columns exist
      const hasRequiredColumns = tableCheck.length > 0 && 
        'position' in tableCheck[0] && 
        'points' in tableCheck[0] && 
        'matches_played' in tableCheck[0]

      if (!hasRequiredColumns) {
        console.warn('Missing required columns. Database migration needed.')
        setStandings([
          { position: 1, team_name: "⚠️ Missing Database Columns", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 2, team_name: "🔧 Run fix_database.sql script", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 3, team_name: "📋 Copy from project files", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 }
        ])
        return
      }

      // Get standings from competition_teams table with simplified query
      const { data, error } = await supabase
        .from('competition_teams')
        .select('position, points, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, team_id')
        .not('position', 'is', null)
        .order('position', { ascending: true })
        .limit(10)

      console.log('Full query result:', { data, error })

      if (error) {
        console.error('Error loading standings:', error)
        // Set helpful error message
        setStandings([
          { position: 1, team_name: "❌ Database Query Failed", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 2, team_name: "🔧 Check database migration", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
          { position: 3, team_name: "📋 Run fix_database.sql", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 }
        ])
        return
      }

      console.log('Found competitions:', data)

      if (data && data.length > 0) {
        const transformedStandings = data.map((standing: any) => ({
          position: standing.position,
          team_name: `Team ${standing.team_id?.substring(0, 8) || standing.position}`,
          points: standing.points || 0,
          matches_played: standing.matches_played || 0,
          wins: standing.wins || 0,
          draws: standing.draws || 0,
          losses: standing.losses || 0,
          goals_for: standing.goals_for || 0,
          goals_against: standing.goals_against || 0,
          goal_difference: standing.goal_difference || 0
        }))
        setStandings(transformedStandings)
      } else {
        console.log('No competition teams found - using demo data')
        // Set mock data if no real data is available
        setStandings([
          { position: 1, team_name: "Manchester United", points: 89, matches_played: 38, wins: 28, draws: 5, losses: 5, goals_for: 85, goals_against: 32, goal_difference: 53 },
          { position: 2, team_name: "Manchester City", points: 78, matches_played: 38, wins: 24, draws: 6, losses: 8, goals_for: 78, goals_against: 45, goal_difference: 33 },
          { position: 3, team_name: "Chelsea", points: 75, matches_played: 38, wins: 23, draws: 6, losses: 9, goals_for: 72, goals_against: 42, goal_difference: 30 },
          { position: 4, team_name: "Arsenal", points: 73, matches_played: 38, wins: 22, draws: 7, losses: 9, goals_for: 68, goals_against: 40, goal_difference: 28 },
          { position: 5, team_name: "Tottenham", points: 72, matches_played: 38, wins: 22, draws: 6, losses: 10, goals_for: 70, goals_against: 48, goal_difference: 22 }
        ])
      }
    } catch (err) {
      console.error('Unexpected error loading standings:', err)
      // Fallback to helpful error message
      setStandings([
        { position: 1, team_name: "❌ Error Loading Data", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 },
        { position: 2, team_name: "🔧 Run Database Migration", points: 0, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0 }
      ])
    }
  }

  const loadGameweekInfo = async () => {
    try {
      // Get current active competitions
      const { data: competitions, error: competitionsError } = await supabase
        .from('competitions')
        .select('id, name, start_date')
        .eq('status', 'active')
        .limit(1)

      if (competitionsError || !competitions || competitions.length === 0) {
        console.log('No active competitions found')
        return
      }

      const competition = competitions[0]
      
      // Get all matches for the active competition to calculate gameweeks
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, match_date, status')
        .eq('competition_id', competition.id)
        .order('match_date', { ascending: true })

      if (matchesError || !matches) {
        console.error('Error loading matches:', matchesError)
        return
      }

      // Calculate current gameweek based on completed/live matches
      const now = new Date()
      const completedMatches = matches.filter(m => 
        m.status === 'completed' || 
        (m.status === 'live' && new Date(m.match_date) <= now)
      )
      
      // Find the next upcoming match for deadline calculation
      const upcomingMatches = matches.filter(m => 
        m.status === 'scheduled' && new Date(m.match_date) > now
      )

      // Calculate current gameweek (assuming matches are grouped by week)
      const currentGameweek = Math.floor(completedMatches.length / (matches.length > 0 ? Math.ceil(matches.length / 38) : 1)) + 1

      let nextDeadline = null
      let timeUntilDeadline = null

      if (upcomingMatches.length > 0) {
        // Get the earliest upcoming match date
        const nextMatchDate = new Date(upcomingMatches[0].match_date)
        // Fantasy deadline is typically 90 minutes before the first match of the gameweek
        const deadlineDate = new Date(nextMatchDate.getTime() - (90 * 60 * 1000))
        
        nextDeadline = deadlineDate.toISOString()
        
        // Calculate time until deadline
        const timeUntil = deadlineDate.getTime() - now.getTime()
        if (timeUntil > 0) {
          const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24))
          const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
          
          if (days > 0) {
            timeUntilDeadline = `${days}D ${hours}H ${minutes}M`
          } else if (hours > 0) {
            timeUntilDeadline = `${hours}H ${minutes}M`
          } else {
            timeUntilDeadline = `${minutes}M`
          }
        }
      }

      setGameweekInfo({
        currentGameweek: Math.max(1, Math.min(currentGameweek, 38)), // Clamp between 1 and 38
        nextDeadline,
        timeUntilDeadline
      })

    } catch (error) {
      console.error('Error loading gameweek info:', error)
    }
  }

  const loadLeagueLeaderboard = async () => {
    try {
      console.log('Loading league leaderboard...')
      
      // Query all fantasy teams with user profiles
      const { data: fantasyTeamsData, error: teamsError } = await supabase
        .from('fantasy_teams')
        .select(`
          id,
          name,
          points,
          user_id
        `)
        .order('points', { ascending: false })
        .limit(50)

      if (teamsError) {
        // Check if it's a missing table error first
        if (teamsError.message?.includes('does not exist') || teamsError.code === '42P01' || JSON.stringify(teamsError) === '{}') {
          console.log('Fantasy teams table not found - showing placeholder')
          setLeagueLeaderboard([
            {
              position: 1,
              user_id: 'placeholder-1',
              user_profile: { display_name: '⚠️ Fantasy Database Not Set Up', username: null, avatar_url: null },
              fantasy_team: { name: 'Create fantasy_teams table', points: 0 }
            },
            {
              position: 2,
              user_id: 'placeholder-2',  
              user_profile: { display_name: '🏆 Ready for Fantasy League', username: null, avatar_url: null },
              fantasy_team: { name: 'Set up fantasy system', points: 0 }
            }
          ])
        } else {
          console.error('Error loading fantasy teams:', teamsError)
          setLeagueLeaderboard([])
        }
        return
      }

      if (!fantasyTeamsData || fantasyTeamsData.length === 0) {
        console.log('No fantasy teams found')
        setLeagueLeaderboard([])
        return
      }

      // Get user profiles for all fantasy team owners
      const userIds = fantasyTeamsData.map(team => team.user_id)
      let profilesData = null
      
      try {
        const { data, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', userIds)

        if (profilesError) {
          if (profilesError.message?.includes('does not exist') || profilesError.code === '42P01') {
            console.log('User profiles table not found - using fallback names')
          } else {
            console.error('Error loading user profiles:', profilesError)
          }
        } else {
          profilesData = data
        }
      } catch (error) {
        console.log('User profiles not available - using fallback names')
      }

      // Transform data for leaderboard
      const leaderboard: FantasyLeaderboardEntry[] = fantasyTeamsData.map((team, index) => {
        const profile = profilesData?.find(p => p.user_id === team.user_id)
        const displayName = profile?.display_name || profile?.username || `Manager ${index + 1}`
        
        return {
          position: index + 1,
          user_id: team.user_id,
          user_profile: {
            display_name: displayName,
            username: profile?.username || displayName,
            avatar_url: profile?.avatar_url || null
          },
          fantasy_team: {
            name: team.name,
            points: team.points || 0
          }
        }
      })

      setLeagueLeaderboard(leaderboard)
      console.log(`Loaded ${leaderboard.length} fantasy teams for league leaderboard`)
      
    } catch (error) {
      console.error('Error loading league leaderboard:', error)
      setLeagueLeaderboard([])
    }
  }

  const loadClubLeaderboard = async () => {
    try {
      console.log('Loading club leaderboard...')
      
      if (!userProfile) {
        console.log('No user profile - cannot determine club')
        setClubLeaderboard([
          {
            position: 1,
            user_id: 'placeholder-1',
            user_profile: { display_name: '🔐 Sign In Required', username: null, avatar_url: null },
            fantasy_team: { name: 'Sign in to see your club leaderboard', points: 0 }
          }
        ])
        return
      }

      // First, find what team the current user is following
      let userTeamId = null
      
      // Check if user is a player
      const { data: playerData } = await supabase
        .from('players')
        .select('team_id')
        .eq('user_id', userProfile.id)
        .limit(1)
        .single()

      if (playerData?.team_id) {
        userTeamId = playerData.team_id
        console.log('User is a player for team:', userTeamId)
      } else {
        // Check if user is a manager
        const { data: managerData } = await supabase
          .from('team_managers')
          .select('team_id')
          .eq('user_id', userProfile.id)
          .limit(1)
          .single()

        if (managerData?.team_id) {
          userTeamId = managerData.team_id
          console.log('User is a manager for team:', userTeamId)
        } else {
          // Check if user is a fan (if you have a fans table)
          const { data: fanData } = await supabase
            .from('team_fans')
            .select('team_id')
            .eq('user_id', userProfile.id)
            .limit(1)
            .single()

          if (fanData?.team_id) {
            userTeamId = fanData.team_id
            console.log('User is a fan of team:', userTeamId)
          }
        }
      }

      if (!userTeamId) {
        console.log('User is not associated with any team')
        setClubLeaderboard([
          {
            position: 1,
            user_id: 'placeholder-1',
            user_profile: { display_name: '📋 No Team Association', username: null, avatar_url: null },
            fantasy_team: { name: 'Join a team as player, manager, or fan', points: 0 }
          }
        ])
        return
      }

      // Find all users associated with the same team
      const teamUserIds = new Set<string>()

      // Get all players from the team
      const { data: teamPlayers } = await supabase
        .from('players')
        .select('user_id')
        .eq('team_id', userTeamId)
        .eq('status', 'active')

      teamPlayers?.forEach(player => teamUserIds.add(player.user_id))

      // Get all managers from the team
      const { data: teamManagers } = await supabase
        .from('team_managers')
        .select('user_id')
        .eq('team_id', userTeamId)

      teamManagers?.forEach(manager => teamUserIds.add(manager.user_id))

      // Get all fans from the team (if table exists)
      const { data: teamFans } = await supabase
        .from('team_fans')
        .select('user_id')
        .eq('team_id', userTeamId)

      teamFans?.forEach(fan => teamUserIds.add(fan.user_id))

      const teamUserIdArray = Array.from(teamUserIds)
      
      if (teamUserIdArray.length === 0) {
        console.log('No team members found')
        setClubLeaderboard([])
        return
      }

      // Get team name first for error messages
      const { data: clubTeamData } = await supabase
        .from('teams')
        .select('name')
        .eq('id', userTeamId)
        .single()

      // Get fantasy teams for team members
      const { data: fantasyTeamsData, error: teamsError } = await supabase
        .from('fantasy_teams')
        .select(`
          id,
          name,
          points,
          user_id
        `)
        .in('user_id', teamUserIdArray)
        .order('points', { ascending: false })

      if (teamsError) {
        // Check if it's a missing table error first
        if (teamsError.message?.includes('does not exist') || teamsError.code === '42P01' || JSON.stringify(teamsError) === '{}') {
          console.log('Fantasy teams table not found for club leaderboard')
          setClubLeaderboard([
            {
              position: 1,
              user_id: 'placeholder-1',
              user_profile: { display_name: '⚠️ Fantasy System Not Set Up', username: null, avatar_url: null },
              fantasy_team: { name: 'Fantasy teams table needed', points: 0 },
              team_name: clubTeamData?.name || 'Your Team'
            }
          ])
        } else {
          console.error('Error loading club fantasy teams:', teamsError)
          setClubLeaderboard([])
        }
        return
      }

      if (!fantasyTeamsData || fantasyTeamsData.length === 0) {
        console.log('No fantasy teams found for team members')
        setClubLeaderboard([])
        return
      }

             // Get user profiles
       let profilesData = null
       try {
         const { data } = await supabase
           .from('user_profiles')
           .select('user_id, display_name, username, avatar_url')
           .in('user_id', fantasyTeamsData.map(t => t.user_id))

         profilesData = data
       } catch (error) {
         console.log('User profiles not available for club leaderboard')
       }

       const teamName = clubTeamData?.name || 'Your Team'

      // Transform data for club leaderboard
      const clubLeaderboard: FantasyLeaderboardEntry[] = fantasyTeamsData.map((team, index) => {
        const profile = profilesData?.find(p => p.user_id === team.user_id)
        const displayName = profile?.display_name || profile?.username || `Team Member ${index + 1}`
        
        return {
          position: index + 1,
          user_id: team.user_id,
          user_profile: {
            display_name: displayName,
            username: profile?.username || displayName,
            avatar_url: profile?.avatar_url || null
          },
          fantasy_team: {
            name: team.name,
            points: team.points || 0
          },
          team_name: teamName
        }
      })

      setClubLeaderboard(clubLeaderboard)
      console.log(`Loaded ${clubLeaderboard.length} fantasy teams for ${teamName} club leaderboard`)
      
    } catch (error) {
      console.error('Error loading club leaderboard:', error)
      setClubLeaderboard([])
    }
  }

  const loadFantasyCompetitions = async () => {
    try {
      if (!supabase) return

      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status, fantasy_enabled')
        .eq('fantasy_enabled', true)
        .eq('status', 'active')
        .order('name')

      if (error) {
        console.error('Error loading fantasy competitions:', error)
        return
      }

      console.log('Found fantasy-enabled competitions:', data)
      setFantasyCompetitions(data || [])
      
      // Auto-select first competition
      if (data && data.length > 0) {
        setSelectedCompetition(data[0].id)
      }
    } catch (error) {
      console.error('Error in loadFantasyCompetitions:', error)
    }
  }

  const loadPlayersForCompetition = async (competitionId: string) => {
    try {
      if (!supabase) return

      console.log('Loading players for competition:', competitionId)

      // First get teams in the competition
      const { data: competitionTeams, error: teamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (teamsError) {
        console.error('Error loading competition teams:', teamsError)
        setAvailablePlayers([])
        return
      }

      if (!competitionTeams || competitionTeams.length === 0) {
        console.log('No teams found in competition')
        setAvailablePlayers([])
        return
      }

      const teamIds = competitionTeams.map(ct => ct.team_id)
      console.log('Found team IDs:', teamIds)

      // Get players from those teams with fantasy stats (including managers)
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          id,
          user_id,
          position,
          number,
          status,
          team_id,
          is_manager,
          fantasy_price,
          fantasy_points,
          avatar_url
        `)
        .in('team_id', teamIds)
        .eq('status', 'active')
        .order('is_manager', { ascending: false }) // Managers first
        .order('number')

      if (playersError) {
        console.error('Error loading players:', playersError)
        // Fallback query without new columns if they don't exist yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('players')
          .select(`
            id,
            user_id,
            position,
            number,
            status,
            team_id
          `)
          .in('team_id', teamIds)
          .eq('status', 'active')
          .order('number')

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
          setAvailablePlayers([])
          return
        }

        // Add default values for missing columns and process fallback data
        const processedPlayersData = (fallbackData || []).map(player => ({
          ...player,
          is_manager: false,
          fantasy_price: 5.0,
          fantasy_points: 0.0,
          avatar_url: null
        }))

        console.log('🔄 Using fallback data with defaults')
        
        if (processedPlayersData.length === 0) {
          console.log('No players found for competition')
          setAvailablePlayers([])
          return
        }

        // Continue with processing using fallback data
        await processPlayersData(processedPlayersData, supabase, competitionId)
        return
      }

      const processedPlayersData = playersData || []

      if (processedPlayersData.length === 0) {
        console.log('No players found for competition')
        setAvailablePlayers([])
        return
      }

      await processPlayersData(processedPlayersData, supabase, competitionId)

    } catch (error) {
      console.error('Error in loadPlayersForCompetition:', error)
      setAvailablePlayers([])
    }
  }

  // Helper function to process players data
  const processPlayersData = async (processedPlayersData: any[], supabase: any, competitionId: string) => {
    // Get user profiles for these players - with robust error handling
    let userProfiles: any[] = []
    let profilesError: any = null
    
    try {
      const result = await supabase
        .from('user_profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', processedPlayersData.map(p => p.user_id))
      
      if (result.error) {
        if (result.error.code === '42703') {
          console.log('🔄 Avatar column not found, retrying without avatar_url...')
          const fallbackResult = await supabase
            .from('user_profiles')
            .select('id, display_name, username')
            .in('id', processedPlayersData.map(p => p.user_id))
          
          userProfiles = fallbackResult.data || []
          profilesError = fallbackResult.error
        } else {
          userProfiles = result.data || []
          profilesError = result.error
        }
      } else {
        userProfiles = result.data || []
      }
    } catch (error) {
      console.error('💥 Error loading user profiles:', error)
      profilesError = error
      userProfiles = []
    }

    // Get teams for these players
    const { data: teamsData, error: teamsDataError } = await supabase
      .from('teams')
      .select('id, name, short_name, logo_url')
      .in('id', processedPlayersData.map(p => p.team_id))

    console.log('Teams query result:', { teams: teamsData?.length, teamsDataError })

    // Get fantasy stats for these players (fallback for existing system)
    const { data: fantasyStats, error: statsError } = await supabase
      .from('fantasy_player_stats')
      .select('player_id, fantasy_points, fantasy_price')
      .in('player_id', processedPlayersData.map(p => p.id))
      .eq('competition_id', competitionId)

    console.log('Fantasy stats query result:', { fantasyStats, statsError })

    // Map players with fantasy data
    const playersWithFantasy = processedPlayersData.map(player => {
      const userProfile = userProfiles?.find(up => up.id === player.user_id)
      const team = teamsData?.find(t => t.id === player.team_id)
      
      // Use player's fantasy_price/points if available, otherwise fallback to fantasy_player_stats
      const playerFantasyPrice = player.fantasy_price || fantasyStats?.find(s => s.player_id === player.id)?.fantasy_price || 5.0
      const playerFantasyPoints = player.fantasy_points || fantasyStats?.find(s => s.player_id === player.id)?.fantasy_points || 0

      return {
        ...player,
        fantasy_price: playerFantasyPrice,
        fantasy_points: playerFantasyPoints,
        user_profile: userProfile || {
          display_name: 'Unknown Player',
          username: 'unknown',
          avatar_url: null
        },
        team: team || {
          id: player.team_id,
          name: 'Unknown Team',
          short_name: 'UNK',
          logo_url: null
        }
      }
    })

    console.log(`Loaded ${playersWithFantasy.length} players with fantasy data`)
    console.log(`Manager-players: ${playersWithFantasy.filter(p => p.is_manager).length}`)
    setAvailablePlayers(playersWithFantasy)
  }

  const handlePlayerAdd = (player: Player) => {
    if (selectedPlayers.length >= 11) {
      toast({
        title: "Squad Full",
        description: "You can only select 11 players for your starting lineup.",
        variant: "destructive",
      })
      return
    }

    if (selectedPlayers.find(p => p.id === player.id)) {
      toast({
        title: "Player Already Selected",
        description: "This player is already in your squad.",
        variant: "destructive",
      })
      return
    }

    const fantasyRole = getFantasyRole(player.position)
    const requiredCount = selectedFormation.positions[fantasyRole]
    const currentCount = selectedPlayers.filter(p => p.fantasyRole === fantasyRole).length

    if (currentCount >= requiredCount) {
      toast({
        title: "Position Full",
        description: `You already have the maximum number of ${fantasyRole} players for this formation.`,
        variant: "destructive",
      })
      return
    }

    const currentBudget = selectedPlayers.reduce((total, p) => total + p.price, 0)
    if (currentBudget + player.fantasy_price > budget) {
      toast({
        title: "Over Budget",
        description: `Adding this player would exceed your £${budget}M budget.`,
        variant: "destructive",
      })
      return
    }

    const selectedPlayer: SelectedPlayer = {
      id: player.id,
      name: player.user_profile.display_name || player.user_profile.username || `Player ${player.number}`,
      position: player.position,
      fantasyRole,
      team: player.team.short_name,
      price: player.fantasy_price,
      points: player.fantasy_points,
      avatar_url: player.user_profile.avatar_url
    }

    setSelectedPlayers([...selectedPlayers, selectedPlayer])
  }

  const handlePlayerRemove = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))
  }

  const handleFormationChange = (formationName: string) => {
    const formation = FANTASY_FORMATIONS.find(f => f.name === formationName)
    if (!formation) return

    setSelectedFormation(formation)
    
    // Remove players that don't fit new formation
    const validPlayers = selectedPlayers.filter(player => {
      const currentCount = selectedPlayers.filter(p => 
        p.fantasyRole === player.fantasyRole && p.id !== player.id
      ).length
      return currentCount < formation.positions[player.fantasyRole]
    })
    
    setSelectedPlayers(validPlayers)
  }

  const handleCreateTeam = async () => {
    if (!userProfile || !supabase) return

    if (!teamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a name for your fantasy team.",
        variant: "destructive",
      })
      return
    }

    if (selectedPlayers.length !== 11) {
      toast({
        title: "Incomplete Squad",
        description: "You need to select exactly 11 players.",
        variant: "destructive",
      })
      return
    }

    if (!isLineupValid(selectedPlayers, selectedFormation.name)) {
      toast({
        title: "Invalid Formation",
        description: "Your selected players don't match the formation requirements.",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingTeam(true)

      // Create fantasy team
      const { data: teamData, error: teamError } = await supabase
        .from('fantasy_teams')
        .insert({
          user_id: userProfile.id,
          competition_id: selectedCompetition,
          name: teamName.trim(),
          budget: budget,
          points: 0
        })
        .select()
        .single()

      if (teamError) {
        console.error('Error creating fantasy team:', teamError)
        throw teamError
      }

      console.log('Fantasy team created:', teamData)
      
      toast({
        title: "Success!",
        description: `Your fantasy team "${teamName}" has been created!`,
      })

      // Update local state
      setFantasyTeam(teamData)
      setShowTeamCreation(false)
      
      // Reload fantasy data
      await loadFantasyData()

    } catch (error: any) {
      console.error('Error creating fantasy team:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create fantasy team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreatingTeam(false)
    }
  }

  // Calculate current budget usage
  const currentBudget = selectedPlayers.reduce((total, player) => total + player.price, 0)
  const remainingBudget = budget - currentBudget
  const isOverBudget = currentBudget > budget
  const isValidLineup = selectedPlayers.length === 11 && isLineupValid(selectedPlayers, selectedFormation.name)

  // Player counts by position
  const playerCounts = {
    GK: selectedPlayers.filter(p => p.fantasyRole === "GK").length,
    DEF: selectedPlayers.filter(p => p.fantasyRole === "DEF").length,
    MID: selectedPlayers.filter(p => p.fantasyRole === "MID").length,
    FWD: selectedPlayers.filter(p => p.fantasyRole === "FWD").length,
  }

  // Filter available players
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = playerSearch === '' || 
      player.user_profile.display_name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
      player.user_profile.username?.toLowerCase().includes(playerSearch.toLowerCase()) ||
      player.team.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
      player.position.toLowerCase().includes(playerSearch.toLowerCase())

    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition

    const alreadySelected = selectedPlayers.find(p => p.id === player.id)
    const fantasyRole = getFantasyRole(player.position)
    const currentCount = selectedPlayers.filter(p => p.fantasyRole === fantasyRole).length
    const maxCount = selectedFormation.positions[fantasyRole]
    const positionAvailable = currentCount < maxCount

    return matchesSearch && matchesPosition && !alreadySelected && positionAvailable
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16">
        <div className="bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent mb-6">FANTASY</h1>
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
              <Skeleton className="h-4 w-20 bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent mb-6">
          FANTASY FOOTBALL
        </h1>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="relative">
          <Image
                src={userProfile?.avatar_url || "/placeholder-avatar.svg"}
            alt="Profile"
            width={48}
            height={48}
                className="rounded-full border-2 border-green-500/30 shadow-lg"
          />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
          <div>
              <h2 className="font-semibold text-green-100 text-lg">
                {userProfile?.display_name || userProfile?.username || 'Manager'}
            </h2>
              <span className={cn(
                "text-sm flex items-center gap-2 px-2 py-1 rounded-full",
                userProfile?.user_type === 'admin' 
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : userProfile?.user_type === 'player'
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : userProfile?.user_type === 'manager'
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : userProfile?.user_type === 'fan'
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  userProfile?.user_type === 'admin' 
                    ? "bg-red-400"
                    : userProfile?.user_type === 'player'
                    ? "bg-blue-400"
                    : userProfile?.user_type === 'manager'
                    ? "bg-purple-400"
                    : userProfile?.user_type === 'fan'
                    ? "bg-green-400"
                    : "bg-gray-400"
                )}></div>
                {userProfile?.user_type ? userProfile.user_type.charAt(0).toUpperCase() + userProfile.user_type.slice(1) : 'Guest'}
              </span>
            </div>
          </div>
          
          {/* Login prompt for non-authenticated users */}
          {!userProfile && (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

              {/* Enhanced Gameweek Stats */}
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Sign in notice for guests */}
        {!userProfile && (
          <div className="mb-6 bg-gradient-to-r from-green-900/40 to-green-800/30 backdrop-blur-sm border border-green-700/40 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-100 mb-2">Create Your Fantasy Team</h3>
              <p className="text-sm text-gray-300 mb-4">Sign in to create your fantasy team, make transfers, and compete with other managers!</p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Fantasy Team Creation Interface */}
        {userProfile && showTeamCreation && (
          <div className="mb-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-100 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                Create Your Fantasy Team
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setShowTeamCreation(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Competition Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-green-300 mb-2">
                Select Competition
              </label>
              <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                <SelectTrigger className="w-full bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 transition-all">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <SelectValue placeholder="Choose a fantasy-enabled competition" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm">
                  {fantasyCompetitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id} className="text-white hover:bg-green-600/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {comp.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompetition && (
              <>
                {/* Team Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    Team Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your fantasy team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 transition-all text-white placeholder-gray-400"
                  />
                </div>

                {/* Formation and Budget Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      Formation
                    </label>
                    <Select value={selectedFormation.name} onValueChange={handleFormationChange}>
                      <SelectTrigger className="w-full bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 transition-all">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-green-400" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm">
                        {FANTASY_FORMATIONS.map((formation) => (
                          <SelectItem key={formation.name} value={formation.name} className="text-white hover:bg-green-600/20">
                            {formation.name} - {formation.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <div className="text-sm text-green-300 mb-1">Budget</div>
                    <div className="text-lg font-bold text-white">
                      £{currentBudget.toFixed(1)}M / £{budget}M
                    </div>
                    <div className="text-xs text-gray-400">
                      £{remainingBudget.toFixed(1)}M remaining
                    </div>
                    {isOverBudget && (
                      <div className="text-xs text-red-400 mt-1">Over budget!</div>
                    )}
                  </div>
                </div>

                {/* Formation Requirements */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <Badge variant="outline" className="text-center border-gray-700 text-gray-300">
                    GK: {playerCounts.GK}/{selectedFormation.positions.GK}
                  </Badge>
                  <Badge variant="outline" className="text-center border-gray-700 text-gray-300">
                    DEF: {playerCounts.DEF}/{selectedFormation.positions.DEF}
                  </Badge>
                  <Badge variant="outline" className="text-center border-gray-700 text-gray-300">
                    MID: {playerCounts.MID}/{selectedFormation.positions.MID}
                  </Badge>
                  <Badge variant="outline" className="text-center border-gray-700 text-gray-300">
                    FWD: {playerCounts.FWD}/{selectedFormation.positions.FWD}
                  </Badge>
                </div>

                {/* Player Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="pl-10 bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 transition-all text-white placeholder-gray-400"
                    />
                  </div>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 transition-all">
                      <SelectValue placeholder="Filter by position" />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm">
                      <SelectItem value="all" className="text-white hover:bg-green-600/20">All Positions</SelectItem>
                      <SelectItem value="GK" className="text-white hover:bg-green-600/20">Goalkeeper</SelectItem>
                      <SelectItem value="CB" className="text-white hover:bg-green-600/20">Centre Back</SelectItem>
                      <SelectItem value="LB" className="text-white hover:bg-green-600/20">Left Back</SelectItem>
                      <SelectItem value="RB" className="text-white hover:bg-green-600/20">Right Back</SelectItem>
                      <SelectItem value="CDM" className="text-white hover:bg-green-600/20">Defensive Mid</SelectItem>
                      <SelectItem value="CM" className="text-white hover:bg-green-600/20">Central Mid</SelectItem>
                      <SelectItem value="CAM" className="text-white hover:bg-green-600/20">Attacking Mid</SelectItem>
                      <SelectItem value="LM" className="text-white hover:bg-green-600/20">Left Mid</SelectItem>
                      <SelectItem value="RM" className="text-white hover:bg-green-600/20">Right Mid</SelectItem>
                      <SelectItem value="LW" className="text-white hover:bg-green-600/20">Left Wing</SelectItem>
                      <SelectItem value="RW" className="text-white hover:bg-green-600/20">Right Wing</SelectItem>
                      <SelectItem value="ST" className="text-white hover:bg-green-600/20">Striker</SelectItem>
                      <SelectItem value="CF" className="text-white hover:bg-green-600/20">Centre Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Squad */}
                {selectedPlayers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-100 mb-3 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      Your Squad ({selectedPlayers.length}/11)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedPlayers.map((player) => (
                        <div key={player.id} className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-3 rounded-lg border border-gray-700/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {player.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{player.name}</div>
                              <div className="text-xs text-gray-400">{player.team} • {player.position}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-green-400 font-medium">£{player.price}M</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePlayerRemove(player.id)}
                              className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Players */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-100 mb-3 flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-green-400" />
                    Available Players ({filteredPlayers.length})
                  </h4>
                  <ScrollArea className="h-80 border border-gray-700/30 rounded-lg bg-gradient-to-br from-gray-900/30 to-gray-800/20">
                    <div className="p-3 space-y-2">
                      {filteredPlayers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          {availablePlayers.length === 0 ? (
                            <div>
                              <Users2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                              <div>No players available</div>
                              <div className="text-sm">Make sure the competition has players and fantasy stats.</div>
                            </div>
                          ) : (
                            <div>
                              <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                              <div>No players match your criteria</div>
                              <div className="text-sm">Try adjusting your search or position filter.</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        filteredPlayers.map((player) => (
                          <div key={player.id} className="bg-gradient-to-r from-gray-800/40 to-gray-700/20 p-3 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all cursor-pointer" onClick={() => handlePlayerAdd(player)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {(player.user_profile.display_name || player.user_profile.username || `P${player.number}`)?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {player.user_profile.display_name || player.user_profile.username || `Player ${player.number}`}
                                  </div>
                                  <div className="text-sm text-gray-400">{player.team.short_name} • {player.position}</div>
                                  <div className="text-xs text-gray-500">{player.fantasy_points} fantasy points</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-semibold">£{player.fantasy_price}M</div>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                  {getFantasyRole(player.position)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Create Team Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {selectedPlayers.length === 11 && isValidLineup ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="w-4 h-4" />
                        Squad complete and valid
                      </div>
                    ) : (
                      <div>
                        Select {11 - selectedPlayers.length} more player{11 - selectedPlayers.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={!teamName.trim() || selectedPlayers.length !== 11 || !isValidLineup || isOverBudget || creatingTeam}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingTeam ? 'Creating...' : 'Create Fantasy Team'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-green-100 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Gameweek {gameweekInfo.currentGameweek}
          </h3>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                  {gameweekStats.totw}
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Team of the Week</p>
              </div>
              <div className="text-center border-x border-gray-700/30">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                  {gameweekStats.points}
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                  {gameweekStats.highest}
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Highest Score</p>
              </div>
          </div>
          </div>
        </div>

        {/* Enhanced Gameweek Info */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-green-100">Gameweek {gameweekInfo.currentGameweek + 1}</h3>
              <p className="text-sm text-gray-400">Upcoming matches</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-300">
                {gameweekInfo.timeUntilDeadline || 'TBD'}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Deadline</p>
        </div>
      </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-green-100 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/fantasy/team" className="group block">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-6 hover:border-green-600/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Shirt className="w-6 h-6 text-white" />
      </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">My Team</h3>
            {fantasyTeam && (
              <p className="text-xs text-gray-400 mt-1">{fantasyTeam.name}</p>
            )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors transform group-hover:translate-x-1 ml-auto mt-2" />
          </Card>
        </Link>
            <Link href="/fantasy/transfers" className="group block">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-6 hover:border-green-600/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">Transfers</h3>
            {fantasyTeam && (
                      <p className="text-xs text-gray-400 mt-1">Budget: ${fantasyTeam.budget}M</p>
            )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors transform group-hover:translate-x-1 ml-auto mt-2" />
          </Card>
        </Link>
            <Link href="/fantasy/statistics" className="group block">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-6 hover:border-green-600/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">Statistics</h3>
            {fantasyTeam && (
              <p className="text-xs text-gray-400 mt-1">{fantasyTeam.points} total points</p>
            )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors transform group-hover:translate-x-1 ml-auto mt-2" />
          </Card>
        </Link>
            <Link href="/fantasy/help" className="group block">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-6 hover:border-green-600/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">Help & Rules</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors transform group-hover:translate-x-1 ml-auto mt-2" />
          </Card>
        </Link>
      </div>
        </div>

        {/* Enhanced Fantasy Leaderboards */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-green-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Fantasy Leaderboard
            </h3>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'league' ? 'default' : 'outline'}
                onClick={() => setActiveTab('league')}
                className={
                  activeTab === 'league' 
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
                    : "border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white px-4 py-2 rounded-lg transition-all"
                }
              >
                League
              </Button>
              <Button 
                variant={activeTab === 'club' ? 'default' : 'outline'}
                onClick={() => setActiveTab('club')}
                className={
                  activeTab === 'club' 
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
                    : "border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white px-4 py-2 rounded-lg transition-all"
                }
              >
                Club
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-5 text-sm text-gray-400 px-4 py-2 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg">
              <div className="font-medium">Pos</div>
              <div className="col-span-2 font-medium">Manager</div>
              <div className="font-medium">Team</div>
              <div className="text-right font-medium">Points</div>
            </div>

            {activeTab === 'league' ? (
              leagueLeaderboard.length > 0 ? (
                leagueLeaderboard.slice(0, 10).map((entry) => (
                  <div key={`league-${entry.user_id}`} className="grid grid-cols-5 items-center py-3 px-4 bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-700/20 rounded-lg hover:border-green-600/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.position <= 3 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-700/50 text-gray-300'
                      }`}>
                        {entry.position}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {entry.user_profile.display_name?.charAt(0) || 'M'}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-white text-sm">
                          {entry.user_profile.display_name || entry.user_profile.username}
                        </div>
                        <div className="text-xs text-gray-400">Fantasy Manager</div>
                      </div>
                    </div>
                    <div className="truncate text-sm text-gray-300">{entry.fantasy_team.name}</div>
                    <div className="text-right font-bold text-green-400">{entry.fantasy_team.points}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users2 className="w-8 h-8 text-green-500/50" />
                  </div>
                  <p className="text-lg mb-2">No Fantasy Teams Yet</p>
                  <p className="text-sm">Be the first to create a fantasy team!</p>
                </div>
              )
            ) : (
              clubLeaderboard.length > 0 ? (
                clubLeaderboard.slice(0, 10).map((entry) => (
                  <div key={`club-${entry.user_id}`} className="grid grid-cols-5 items-center py-3 px-4 bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-700/20 rounded-lg hover:border-green-600/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.position <= 3 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-700/50 text-gray-300'
                      }`}>
                        {entry.position}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {entry.user_profile.display_name?.charAt(0) || 'M'}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-white text-sm">
                          {entry.user_profile.display_name || entry.user_profile.username}
                        </div>
                        <div className="text-xs text-gray-400">{entry.team_name || 'Team Member'}</div>
                      </div>
                    </div>
                    <div className="truncate text-sm text-gray-300">{entry.fantasy_team.name}</div>
                    <div className="text-right font-bold text-green-400">{entry.fantasy_team.points}</div>
              </div>
            ))
          ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-8 h-8 text-green-500/50" />
                  </div>
                  <p className="text-lg mb-2">No Club Fantasy Teams</p>
                  <p className="text-sm">
                    {userProfile ? 'No fantasy teams from your club members yet' : 'Sign in to see your club leaderboard'}
                  </p>
                </div>
              )
            )}
            </div>

          {((activeTab === 'league' && leagueLeaderboard.length > 10) || 
            (activeTab === 'club' && clubLeaderboard.length > 10)) && (
            <Button 
              variant="outline" 
              className="w-full mt-6 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white py-3 rounded-lg transition-all"
            >
              View All {activeTab === 'league' ? 'League' : 'Club'} Rankings
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
