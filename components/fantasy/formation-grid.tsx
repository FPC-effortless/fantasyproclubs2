import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { FANTASY_FORMATIONS, isLineupValid, getFantasyRole } from '@/lib/fantasy/formations'

interface Player {
  id: string
  name: string
  position: PositionType
  team: string
  price: number
  points: number
}

type PositionType = "GK" | "DEF" | "MID" | "FWD"

interface Position {
  id: string
  x: number
  y: number
  type: PositionType
  displayType: string
  allowedPositions: string[]
  isWide?: boolean
}

interface FormationGridProps {
  formation: string
  players: Player[]
  onPlayerDrop: (playerId: string, position: string) => void
}

// Updated position limits to match fantasy formations
const POSITION_LIMITS = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 3, max: 6 }, // Updated to allow 6 midfielders for 3-4-2-1
  FWD: { min: 1, max: 3 },
} as const

function getFormationPositions(formation: string): Position[] {
  const positions: Position[] = []

  // Add goalkeeper
  positions.push({
    id: "gk",
    x: 50,
    y: 90,
    type: "GK",
    displayType: "GK",
    allowedPositions: ["GK"]
  })

  // Add defenders
  const defCount = parseInt(formation.split("-")[0])
  const defSpacing = 100 / (defCount + 1)
  positions.push(...Array.from({ length: defCount }, (_, index) => {
    const isWide = index === 0 || index === defCount - 1
    return {
      id: `def-${index}`,
      x: defSpacing * (index + 1),
      y: 70,
      type: "DEF" as PositionType,
      displayType: isWide ? (index === 0 ? "LB" : "RB") : "CB",
      allowedPositions: ["DEF"],
      isWide
    }
  }))

  // Add midfielders
  const midCount = parseInt(formation.split("-")[1])
  const midSpacing = 100 / (midCount + 1)
  positions.push(...Array.from({ length: midCount }, (_, index) => {
    const isWide = index === 0 || index === midCount - 1
    return {
      id: `mid-${index}`,
      x: midSpacing * (index + 1),
      y: 45,
      type: "MID" as PositionType,
      displayType: isWide ? (index === 0 ? "LM" : "RM") : "CM",
      allowedPositions: ["MID"],
      isWide
    }
  }))

  // Add forwards
  const fwdCount = parseInt(formation.split("-")[2])
  const fwdSpacing = 100 / (fwdCount + 1)
  positions.push(...Array.from({ length: fwdCount }, (_, index) => {
    const isWide = index === 0 || index === fwdCount - 1
    return {
      id: `fwd-${index}`,
      x: fwdSpacing * (index + 1),
      y: 20,
      type: "FWD" as PositionType,
      displayType: isWide ? (index === 0 ? "LW" : "RW") : "ST",
      allowedPositions: ["FWD"],
      isWide
    }
  }))

  return positions
}

export function FormationGrid({ formation, players, onPlayerDrop }: FormationGridProps) {
  const positions = getFormationPositions(formation)
  
  // Use fantasy formation validation
  const isValidFormation = isLineupValid(players, formation)
  
  const playerCounts = {
    GK: players.filter(p => getFantasyRole(p.position) === "GK").length,
    DEF: players.filter(p => getFantasyRole(p.position) === "DEF").length,
    MID: players.filter(p => getFantasyRole(p.position) === "MID").length,
    FWD: players.filter(p => getFantasyRole(p.position) === "FWD").length,
  }

  const formationLabel = `${playerCounts.DEF}-${playerCounts.MID}-${playerCounts.FWD}`

  return (
    <div className="relative w-full aspect-[3/2] bg-[#1a472a] rounded-lg overflow-hidden">
      {/* Field markings */}
      <div className="absolute inset-0 border-2 border-white/20">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 border-2 border-white/20 rounded-full" />
        {/* Center line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/20" />
      </div>

      {/* Formation label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm font-medium">
        {formationLabel}
      </div>

      {/* Warning for invalid formation */}
      {!isValidFormation && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500/50 rounded-full text-white text-sm">
          Invalid fantasy formation - use only allowed formations
        </div>
      )}

      {/* Position markers */}
      {positions.map((position) => {
        const assignedPlayer = players.find(p => p.position === position.type)
        return (
          <div
            key={position.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            onDrop={(e) => {
              e.preventDefault()
              const playerId = e.dataTransfer.getData("text/plain")
              onPlayerDrop(playerId, position.type)
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {assignedPlayer ? (
              <Card className="w-16 h-20 bg-[#00ff87]/20 border-[#00ff87]">
                <CardContent className="p-2 text-center">
                  <div className="text-xs text-white font-medium">
                    {assignedPlayer.name.split(' ').pop()}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {position.displayType}
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              <div className="w-16 h-20 border-2 border-white/40 border-dashed rounded-lg bg-white/10 flex flex-col items-center justify-center">
                <User className="h-6 w-6 text-white/60 mb-1" />
                <span className="text-xs text-white/80">{position.displayType}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 
