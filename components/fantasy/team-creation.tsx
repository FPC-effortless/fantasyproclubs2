import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Shirt, Users2, BarChart3, HelpCircle, Plus, Search, Trophy, X, Check, Crown, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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

interface TeamCreationProps {
  competitions: any[]
  selectedCompetition: string
  onCompetitionChange: (value: string) => void
  availablePlayers: any[]
  selectedPlayers: any[]
  selectedFormation: typeof FANTASY_FORMATIONS[0]
  onFormationChange: (formation: typeof FANTASY_FORMATIONS[0]) => void
  teamName: string
  onTeamNameChange: (value: string) => void
  playerSearch: string
  onPlayerSearchChange: (value: string) => void
  selectedPosition: string
  onPositionChange: (value: string) => void
  budget: number
  creatingTeam: boolean
  onPlayerAdd: (player: any) => void
  onPlayerRemove: (playerId: string) => void
  onCreateTeam: () => void
  onClose: () => void
}

export default function TeamCreation({
  competitions,
  selectedCompetition,
  onCompetitionChange,
  availablePlayers,
  selectedPlayers,
  selectedFormation,
  onFormationChange,
  teamName,
  onTeamNameChange,
  playerSearch,
  onPlayerSearchChange,
  selectedPosition,
  onPositionChange,
  budget,
  creatingTeam,
  onPlayerAdd,
  onPlayerRemove,
  onCreateTeam,
  onClose
}: TeamCreationProps) {
  const remainingBudget = budget - selectedPlayers.reduce((sum, player) => sum + player.price, 0)
  const isLineupValid = selectedPlayers.length === 11

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Fantasy Team</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Team Setup */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Team Name</label>
              <Input
                value={teamName}
                onChange={(e) => onTeamNameChange(e.target.value)}
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Competition</label>
              <Select value={selectedCompetition} onValueChange={onCompetitionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Formation</label>
              <div className="grid grid-cols-2 gap-2">
                {FANTASY_FORMATIONS.map((formation) => (
                  <Button
                    key={formation.name}
                    variant={selectedFormation.name === formation.name ? "default" : "outline"}
                    onClick={() => onFormationChange(formation)}
                    className="justify-start"
                  >
                    {formation.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Selected Players</label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="mb-2 flex items-center justify-between rounded-md bg-muted p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Shirt className="h-4 w-4" />
                      <span>{player.name}</span>
                      <Badge variant="secondary">{player.position}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayerRemove(player.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className="text-lg font-semibold">${remainingBudget}M</p>
              </div>
              <Button
                onClick={onCreateTeam}
                disabled={!isLineupValid || creatingTeam}
              >
                {creatingTeam ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </div>

          {/* Right Column - Player Selection */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Search Players</label>
              <div className="flex space-x-2">
                <Input
                  value={playerSearch}
                  onChange={(e) => onPlayerSearchChange(e.target.value)}
                  placeholder="Search by name"
                />
                <Select value={selectedPosition} onValueChange={onPositionChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="GK">Goalkeeper</SelectItem>
                    <SelectItem value="DEF">Defender</SelectItem>
                    <SelectItem value="MID">Midfielder</SelectItem>
                    <SelectItem value="FWD">Forward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="mb-2 flex items-center justify-between rounded-md bg-muted p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Shirt className="h-4 w-4" />
                    <span>{player.user_profile?.display_name || player.user_profile?.username}</span>
                    <Badge variant="secondary">{player.position}</Badge>
                    <Badge variant="outline">${player.fantasy_price}M</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayerAdd(player)}
                    disabled={selectedPlayers.some((p) => p.id === player.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  )
} 