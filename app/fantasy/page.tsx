"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingState } from "@/components/loading-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import type { UserProfile, FantasyTeam, Standing, Player, Competition, Formation } from "@/types/fantasy"

// Dynamic imports with loading states
const TeamCreation = dynamic(
  () => import("@/components/fantasy/team-creation"),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

const Leaderboard = dynamic(
  () => import("@/components/fantasy/leaderboard"),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

const Standings = dynamic(
  () => import("@/components/fantasy/standings"),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

const GameweekInfo = dynamic(
  () => import("@/components/fantasy/gameweek-info"),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

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

export default function FantasyPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fantasyTeam, setFantasyTeam] = useState<FantasyTeam | null>(null)
  const [standings, setStandings] = useState<Standing[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTeamCreation, setShowTeamCreation] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [selectedFormation, setSelectedFormation] = useState<Formation>({
    name: "4-4-2",
    positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    description: "Balanced formation with solid midfield"
  })
  const [teamName, setTeamName] = useState("")
  const [playerSearch, setPlayerSearch] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("all")
  const [creatingTeam, setCreatingTeam] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          setUserProfile(profile)

          const { data: team } = await supabase
            .from("fantasy_teams")
            .select("*")
            .eq("manager_id", user.id)
            .single()
          setFantasyTeam(team)
        }

        const { data: standingsData } = await supabase
          .from("fantasy_standings")
          .select("*")
          .order("points", { ascending: false })
        setStandings(standingsData || [])

        const { data: playersData } = await supabase
          .from("players")
          .select("*, user_profiles(*)")
        setAvailablePlayers(playersData || [])

        const { data: competitionsData } = await supabase
          .from("competitions")
          .select("*")
        if (Array.isArray(competitionsData) && competitionsData.length > 0) {
          setCompetitions(competitionsData)
          setSelectedCompetition(competitionsData[0].id)
        } else {
          setCompetitions([])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load fantasy data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase, toast])

  const handleCreateTeam = async () => {
    if (!userProfile) return

    setCreatingTeam(true)
    try {
      const { data: team, error } = await supabase
        .from("fantasy_teams")
        .insert({
          name: teamName,
          manager_id: userProfile.id,
          competition_id: selectedCompetition,
          formation: selectedFormation.name,
          players: selectedPlayers.map(p => p.id)
        })
        .select()
        .single()

      if (error) throw error

      setFantasyTeam(team)
      setShowTeamCreation(false)
      toast({
        title: "Success",
        description: "Fantasy team created successfully"
      })
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create fantasy team",
        variant: "destructive"
      })
    } finally {
      setCreatingTeam(false)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fantasy Pro Clubs</h1>
        {!fantasyTeam && (
          <Button onClick={() => setShowTeamCreation(true)}>
            Create Team
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-team">My Team</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <GameweekInfo
              currentGameweek={1}
              nextGameweek={2}
              deadline="2024-03-20 18:30"
              isLoading={isLoading}
            />
            <Leaderboard
              standings={standings}
              isLoading={isLoading}
            />
          </div>
          <Standings
            standings={standings}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="my-team">
          {fantasyTeam ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">{fantasyTeam.name}</h2>
              {/* Team details will go here */}
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't created a fantasy team yet
              </p>
              <Button onClick={() => setShowTeamCreation(true)}>
                Create Team
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transfers">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Transfers</h2>
            {/* Transfers will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="fixtures">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Fixtures</h2>
            {/* Fixtures will go here */}
          </Card>
        </TabsContent>
      </Tabs>

      {showTeamCreation && (
        <TeamCreation
          competitions={competitions}
          selectedCompetition={selectedCompetition}
          onCompetitionChange={setSelectedCompetition}
          availablePlayers={availablePlayers}
          selectedPlayers={selectedPlayers}
          selectedFormation={selectedFormation}
          onFormationChange={setSelectedFormation}
          teamName={teamName}
          onTeamNameChange={setTeamName}
          playerSearch={playerSearch}
          onPlayerSearchChange={setPlayerSearch}
          selectedPosition={selectedPosition}
          onPositionChange={setSelectedPosition}
          budget={100}
          creatingTeam={creatingTeam}
          onPlayerAdd={(player) => setSelectedPlayers([...selectedPlayers, player])}
          onPlayerRemove={(playerId) => setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))}
          onCreateTeam={handleCreateTeam}
          onClose={() => setShowTeamCreation(false)}
        />
      )}
    </div>
  )
}
