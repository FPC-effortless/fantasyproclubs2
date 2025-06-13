"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Send,
  Edit,
  Unlock,
  Users,
  Bot,
  UserCheck,
  Save
} from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  kickoff_time: string
  competition_name?: string
  status: string
}

interface Player {
  id: string
  user_id: string
  full_name: string
  position: string
  number: number | null
  team_id: string
}

interface AIPlayer {
  id: string
  name: string
  position: string
  isAI: true
}

interface Lineup {
  id: string
  team_id: string
  match_id: string
  formation: string
  name: string
  submitted_at?: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'draft'
  admin_override_allowed: boolean
  lineup_players: LineupPlayer[]
}

interface LineupPlayer {
  id: string
  lineup_id: string
  player_id: string | null
  position: string
  player_order: number
  is_ai_player: boolean
  ai_player_name?: string
  player?: Player
}

interface Formation {
  name: string
  positions: {
    position: string
    x: number
    y: number
    label: string
  }[]
}

interface PositionAssignment {
  position: string
  label: string
  assignedPlayer: Player | AIPlayer | null
  x: number
  y: number
}

const formations: Formation[] = [
  // 🛡️ Defensive & Balanced Formations
  {
    name: "4-1-4-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "RM", x: 80, y: 40, label: "RM" },
      { position: "CM", x: 60, y: 40, label: "CM" },
      { position: "CM", x: 40, y: 40, label: "CM" },
      { position: "LM", x: 20, y: 40, label: "LM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-3-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 75, y: 30, label: "RW" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "LW", x: 25, y: 30, label: "LW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-3-1 Wide",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 85, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 15, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 85, y: 30, label: "RW" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "LW", x: 15, y: 30, label: "LW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-4-1-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "CF", x: 50, y: 25, label: "CF" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-5-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 85, y: 45, label: "RM" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 45, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "LM", x: 15, y: 45, label: "LM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "5-1-2-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 70, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 70, label: "LWB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 65, y: 35, label: "CM" },
      { position: "CM", x: 35, y: 35, label: "CM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  // ⚽ Attacking & Possession-Based Formations
  {
    name: "4-1-2-1-2 Narrow",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 60, y: 40, label: "CM" },
      { position: "CM", x: 40, y: 40, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-1-2-1-2 Wide",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 85, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 15, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 70, y: 40, label: "CM" },
      { position: "CM", x: 30, y: 40, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-2-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "CAM", x: 65, y: 30, label: "CAM" },
      { position: "CAM", x: 35, y: 30, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-4",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 80, y: 25, label: "RW" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
      { position: "LW", x: 20, y: 25, label: "LW" },
    ]
  },
  {
    name: "4-3-3",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 Holding",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 65, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 40, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 Attack",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 60, y: 50, label: "CM" },
      { position: "CM", x: 40, y: 50, label: "CM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 False 9",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "CF", x: 50, y: 25, label: "CF" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-2-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "CAM", x: 60, y: 30, label: "CAM" },
      { position: "CAM", x: 40, y: 30, label: "CAM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-4-2-1",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RM", x: 85, y: 50, label: "RM" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "LM", x: 15, y: 50, label: "LM" },
      { position: "CAM", x: 60, y: 30, label: "CAM" },
      { position: "CAM", x: 40, y: 30, label: "CAM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-4-3",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RM", x: 85, y: 50, label: "RM" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "LM", x: 15, y: 50, label: "LM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  // 🔁 Hybrid & Tactical Formations
  {
    name: "4-1-3-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CAM", x: 70, y: 35, label: "CAM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "CAM", x: 30, y: 35, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-3-1-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-4-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  },
  {
    name: "4-4-2 Holding",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  },
  {
    name: "5-2-1-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 65, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 65, label: "LWB" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "5-3-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 65, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 65, label: "LWB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-5-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RWB", x: 85, y: 50, label: "RWB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "LWB", x: 15, y: 50, label: "LWB" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  }
]

interface LineupBuilderProps {
  userTeamId: string
  userRole: 'manager' | 'player'
}

export function LineupBuilder({ userTeamId, userRole }: LineupBuilderProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formations[0])
  const [positionAssignments, setPositionAssignments] = useState<PositionAssignment[]>([])
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [lineupName, setLineupName] = useState("")
  const [existingLineup, setExistingLineup] = useState<Lineup | null>(null)

  // Create AI player options
  const aiPlayers: AIPlayer[] = [
    { id: "ai-gk", name: "AI Goalkeeper", position: "GK", isAI: true },
    { id: "ai-def", name: "AI Defender", position: "DEF", isAI: true },
    { id: "ai-mid", name: "AI Midfielder", position: "MID", isAI: true },
    { id: "ai-fwd", name: "AI Forward", position: "FWD", isAI: true },
  ]

  useEffect(() => {
    if (userTeamId) {
      loadData()
    }
  }, [userTeamId])

  useEffect(() => {
    if (selectedFormation) {
      initializePositions()
    }
  }, [selectedFormation])

  async function loadData() {
    setLoading(true)
    try {
      await Promise.all([loadUpcomingMatches(), loadTeamPlayers()])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load lineup data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadUpcomingMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name),
        competitions(name)
      `)
      .or(`home_team_id.eq.${userTeamId},away_team_id.eq.${userTeamId}`)
      .gte('kickoff_time', new Date().toISOString())
      .order('kickoff_time')

    if (error) throw error

    const formattedMatches = data?.map(match => ({
      ...match,
      home_team_name: match.home_team?.name || 'Unknown Team',
      away_team_name: match.away_team?.name || 'Unknown Team',
      competition_name: match.competitions?.name || 'Unknown Competition'
    })) || []

    setMatches(formattedMatches)
  }

  async function loadTeamPlayers() {
    console.log('Loading team players for team ID:', userTeamId)
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        user_profiles(full_name)
      `)
      .eq('team_id', userTeamId)
      .eq('status', 'active')
      .order('number')

    if (error) {
      console.error('Error loading team players:', error)
      throw error
    }
    
    console.log('Raw team players data:', data)
    console.log('Number of players found:', data?.length || 0)
    
    const formattedPlayers = data?.map(player => ({
      ...player,
      full_name: player.user_profiles?.full_name || 'Unknown Player'
    })) || []

    console.log('Formatted team players:', formattedPlayers)
    setTeamPlayers(formattedPlayers)
  }

  async function loadExistingLineup(matchId: string) {
    const { data, error } = await supabase
      .from('lineups')
      .select(`
        *,
        lineup_players(
          *,
          players(
            *,
            user_profiles(full_name)
          )
        )
      `)
      .eq('team_id', userTeamId)
      .eq('match_id', matchId)
      .single()

    if (error) {
      console.log('No existing lineup found for this match')
      setExistingLineup(null)
      return
    }

    setExistingLineup(data)
    setLineupName(data.name)
    
    // Load formation
    const formation = formations.find(f => f.name === data.formation)
    if (formation) {
      setSelectedFormation(formation)
    }

    // Load player assignments
    const assignments = formation?.positions.map(pos => {
      const lineupPlayer = data.lineup_players?.find((lp: any) => lp.position === pos.position)
      let assignedPlayer = null

      if (lineupPlayer) {
        if (lineupPlayer.is_ai_player) {
          assignedPlayer = {
            id: `ai-${pos.position}`,
            name: lineupPlayer.ai_player_name || 'AI',
            position: pos.position,
            isAI: true
          }
        } else if (lineupPlayer.player) {
          assignedPlayer = {
            ...lineupPlayer.player,
            full_name: lineupPlayer.player.user_profiles?.full_name || 'Unknown Player'
          }
        }
      }

      return {
        position: pos.position,
        label: pos.label,
        assignedPlayer,
        x: pos.x,
        y: pos.y
      }
    }) || []

    setPositionAssignments(assignments)
  }

  function initializePositions() {
    const assignments = selectedFormation.positions.map(pos => ({
      position: pos.position,
      label: pos.label,
      assignedPlayer: null,
      x: pos.x,
      y: pos.y
    }))
    setPositionAssignments(assignments)
  }

  function assignPlayerToPosition(positionIndex: number, player: Player | AIPlayer | null) {
    const newAssignments = [...positionAssignments]
    newAssignments[positionIndex] = {
      ...newAssignments[positionIndex],
      assignedPlayer: player
    }
    setPositionAssignments(newAssignments)
  }

  function getTimeUntilDeadline(match: Match) {
    const kickoffTime = new Date(match.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000) // 3 hours before
    const now = new Date()
    const diffMs = deadlineTime.getTime() - now.getTime()
    
    if (diffMs <= 0) return null
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  function isSubmissionAllowed(match: Match) {
    const kickoffTime = new Date(match.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000)
    const now = new Date()
    
    // Allow if within deadline OR admin override is enabled
    return now <= deadlineTime || (existingLineup?.admin_override_allowed && userRole === 'manager')
  }

  async function submitLineup() {
    if (!selectedMatch) return

    try {
      // Validate lineup (must have 11 players)
      const assignedCount = positionAssignments.filter(pos => pos.assignedPlayer).length
      if (assignedCount !== 11) {
        toast({
          title: "Incomplete Lineup",
          description: `Please assign players to all 11 positions. Currently assigned: ${assignedCount}/11`,
          variant: "destructive",
        })
        return
      }

      // Create or update lineup
      const lineupData = {
        team_id: userTeamId,
        match_id: selectedMatch.id,
        formation: selectedFormation.name,
        name: lineupName || `${selectedMatch.home_team_name} vs ${selectedMatch.away_team_name}`,
        submitted_at: new Date().toISOString(),
        verification_status: 'pending',
        kickoff_time: selectedMatch.kickoff_time,
        match_name: `${selectedMatch.home_team_name} vs ${selectedMatch.away_team_name}`
      }

      let lineupResult
      if (existingLineup) {
        const { data, error } = await supabase
          .from('lineups')
          .update(lineupData)
          .eq('id', existingLineup.id)
          .select()
          .single()
        
        if (error) throw error
        lineupResult = data
      } else {
        const { data, error } = await supabase
          .from('lineups')
          .insert(lineupData)
          .select()
          .single()
        
        if (error) throw error
        lineupResult = data
      }

      // Clear existing lineup players
      await supabase
        .from('lineup_players')
        .delete()
        .eq('lineup_id', lineupResult.id)

      // Insert new lineup players
      const lineupPlayers = positionAssignments
        .filter(pos => pos.assignedPlayer)
        .map((pos, index) => {
          const player = pos.assignedPlayer!
          return {
            lineup_id: lineupResult.id,
            player_id: 'isAI' in player ? null : player.id,
            position: pos.position,
            player_order: index + 1,
            is_ai_player: 'isAI' in player,
            ai_player_name: 'isAI' in player ? player.name : null
          }
        })

      const { error: playersError } = await supabase
        .from('lineup_players')
        .insert(lineupPlayers)

      if (playersError) throw playersError

      toast({
        title: "Success",
        description: "Lineup submitted successfully and is pending admin verification",
      })

      setIsSubmitDialogOpen(false)
      setSelectedMatch(null)
      initializePositions()
      setLineupName("")
      setExistingLineup(null)
    } catch (error: any) {
      console.error('Error submitting lineup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit lineup",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    )
  }

  if (userRole !== 'manager') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Manager Access Only</h3>
          <p className="text-muted-foreground">
            Only team managers can submit lineups for matches.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Lineup Management</CardTitle>
          <CardDescription>
            Create and submit lineups for upcoming matches. Select from your team players or assign AI for any position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Matches</h3>
              <p>There are no upcoming matches that require lineup submission.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const timeUntilDeadline = getTimeUntilDeadline(match)
                const canSubmit = isSubmissionAllowed(match)
                const isUserTeamHome = match.home_team_id === userTeamId

                return (
                  <Card key={match.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {match.home_team_name} vs {match.away_team_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {match.competition_name} • {new Date(match.kickoff_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={isUserTeamHome ? "default" : "secondary"}>
                          {isUserTeamHome ? "Home" : "Away"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {timeUntilDeadline ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{timeUntilDeadline} left</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Deadline passed</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedMatch(match)
                            loadExistingLineup(match.id)
                            setIsSubmitDialogOpen(true)
                          }}
                          disabled={!canSubmit}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {canSubmit ? 'Manage Lineup' : 'Deadline Passed'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lineup Builder Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Build Your Lineup</DialogTitle>
            <DialogDescription>
              {selectedMatch && (
                <>Assign players for {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formation & Settings */}
            <div className="space-y-4">
              <div>
                <Label>Lineup Name</Label>
                <Input
                  value={lineupName}
                  onChange={(e) => setLineupName(e.target.value)}
                  placeholder="Enter lineup name"
                />
              </div>
              
              <div>
                <Label>Formation</Label>
                <Select 
                  value={selectedFormation.name}
                  onValueChange={(value) => {
                    const formation = formations.find(f => f.name === value)
                    if (formation) {
                      setSelectedFormation(formation)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formations.map((formation) => (
                      <SelectItem key={formation.name} value={formation.name}>
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign Players to Positions</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {positionAssignments.map((assignment, index) => (
                    <div key={assignment.position} className="p-2 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">{assignment.label}</Label>
                        {assignment.assignedPlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => assignPlayerToPosition(index, null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      
                      <Select
                        value={assignment.assignedPlayer?.id || ""}
                        onValueChange={(value) => {
                          if (value === "") {
                            assignPlayerToPosition(index, null)
                          } else if (value.startsWith("ai-")) {
                            const aiPlayer = aiPlayers.find(ai => ai.id === value)
                            if (aiPlayer) assignPlayerToPosition(index, aiPlayer)
                          } else {
                            const player = teamPlayers.find(p => p.id === value)
                            if (player) assignPlayerToPosition(index, player)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select player or AI" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No assignment</SelectItem>
                          
                          {/* AI Players */}
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b">
                            AI Players
                          </div>
                          {aiPlayers.map((aiPlayer) => (
                            <SelectItem key={aiPlayer.id} value={aiPlayer.id}>
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-blue-500" />
                                {aiPlayer.name}
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Team Players */}
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b">
                            Team Players
                          </div>
                          {teamPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-500" />
                                {player.full_name} #{player.number || 'N/A'}
                                <Badge variant="outline" className="text-xs">
                                  {player.position}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {assignment.assignedPlayer && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {'isAI' in assignment.assignedPlayer ? (
                            <div className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              AI Player
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {assignment.assignedPlayer.position} • #{assignment.assignedPlayer.number || 'N/A'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formation Pitch */}
            <div className="lg:col-span-2 space-y-4">
              <Label>Formation Preview</Label>
              <div className="relative bg-green-100 rounded-lg aspect-[4/3] border-2 border-green-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300">
                  {/* Pitch markings */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white border-b-0"></div>
                  
                  {/* Position dots */}
                  {positionAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className={`absolute w-12 h-12 border-2 border-white rounded-full flex flex-col items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer transition-colors ${
                        assignment.assignedPlayer 
                          ? 'isAI' in assignment.assignedPlayer 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      style={{
                        left: `${assignment.x}%`,
                        top: `${assignment.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={assignment.assignedPlayer ? 
                        ('isAI' in assignment.assignedPlayer ? 
                          `${assignment.label}: ${assignment.assignedPlayer.name}` : 
                          `${assignment.label}: ${assignment.assignedPlayer.full_name}`) : 
                        `${assignment.label}: Unassigned`}
                    >
                      <div className="text-[8px]">{assignment.label}</div>
                      {assignment.assignedPlayer && (
                        <div className="text-[6px] mt-[-2px]">
                          {'isAI' in assignment.assignedPlayer ? 'AI' : `#${assignment.assignedPlayer.number || '?'}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Assigned: {positionAssignments.filter(p => p.assignedPlayer).length}/11</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Team Players</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>AI Players</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Unassigned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitLineup}
              disabled={positionAssignments.filter(p => p.assignedPlayer).length !== 11}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Lineup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 