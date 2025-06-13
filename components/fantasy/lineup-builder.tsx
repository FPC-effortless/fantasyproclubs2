import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save, Users } from "lucide-react"
import { FANTASY_FORMATIONS, isLineupValid, getFantasyRole } from '@/lib/fantasy/formations'
import { FormationGrid } from './formation-grid'

interface Player {
  id: string
  name: string
  position: string
  fantasyRole?: 'GK' | 'DEF' | 'MID' | 'FWD'
  team: string
  price: number
  points: number
}

interface FantasyLineupBuilderProps {
  availablePlayers: Player[]
  onSaveLineup: (lineup: Player[], formation: string) => void
  maxBudget?: number
}

export function FantasyLineupBuilder({ 
  availablePlayers, 
  onSaveLineup, 
  maxBudget = 100 
}: FantasyLineupBuilderProps) {
  const [selectedFormation, setSelectedFormation] = useState(FANTASY_FORMATIONS[0])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])

  // Calculate current team stats
  const currentBudget = selectedPlayers.reduce((total, player) => total + player.price, 0)
  const remainingBudget = maxBudget - currentBudget
  const isOverBudget = currentBudget > maxBudget
  const isValidLineup = isLineupValid(selectedPlayers, selectedFormation.name)
  const playerCounts = {
    GK: selectedPlayers.filter(p => getFantasyRole(p.position) === "GK").length,
    DEF: selectedPlayers.filter(p => getFantasyRole(p.position) === "DEF").length,
    MID: selectedPlayers.filter(p => getFantasyRole(p.position) === "MID").length,
    FWD: selectedPlayers.filter(p => getFantasyRole(p.position) === "FWD").length,
  }

  const handlePlayerAdd = (player: Player) => {
    if (selectedPlayers.length >= 11) return
    if (selectedPlayers.find(p => p.id === player.id)) return
    
    const fantasyRole = getFantasyRole(player.position)
    const requiredCount = selectedFormation.positions[fantasyRole]
    const currentCount = selectedPlayers.filter(p => getFantasyRole(p.position) === fantasyRole).length
    
    if (currentCount >= requiredCount) {
      // Position is full, don't add
      return
    }

    setSelectedPlayers([...selectedPlayers, { ...player, fantasyRole }])
  }

  const handlePlayerRemove = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))
  }

  const handleFormationChange = (formationName: string) => {
    const formation = FANTASY_FORMATIONS.find(f => f.name === formationName)
    if (formation) {
      setSelectedFormation(formation)
      // Clear players that don't fit new formation
      const validPlayers = selectedPlayers.filter(player => {
        const role = getFantasyRole(player.position)
        const currentCount = selectedPlayers.filter(p => 
          getFantasyRole(p.position) === role && p.id !== player.id
        ).length
        return currentCount < formation.positions[role]
      })
      setSelectedPlayers(validPlayers)
    }
  }

  const handleSaveLineup = () => {
    if (isValidLineup && !isOverBudget && selectedPlayers.length === 11) {
      onSaveLineup(selectedPlayers, selectedFormation.name)
    }
  }

  // Filter available players by position for easier selection
  const getAvailablePlayersByRole = (role: 'GK' | 'DEF' | 'MID' | 'FWD') => {
    return availablePlayers.filter(player => {
      const playerRole = getFantasyRole(player.position)
      const isAlreadySelected = selectedPlayers.find(p => p.id === player.id)
      const currentCount = selectedPlayers.filter(p => getFantasyRole(p.position) === role).length
      const maxCount = selectedFormation.positions[role]
      
      return playerRole === role && !isAlreadySelected && currentCount < maxCount
    })
  }

  return (
    <div className="space-y-6">
      {/* Formation Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fantasy Formation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select 
                value={selectedFormation.name}
                onValueChange={handleFormationChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FANTASY_FORMATIONS.map((formation) => (
                    <SelectItem key={formation.name} value={formation.name}>
                      {formation.name} - {formation.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">GK: {playerCounts.GK}/{selectedFormation.positions.GK}</Badge>
              <Badge variant="outline">DEF: {playerCounts.DEF}/{selectedFormation.positions.DEF}</Badge>
              <Badge variant="outline">MID: {playerCounts.MID}/{selectedFormation.positions.MID}</Badge>
              <Badge variant="outline">FWD: {playerCounts.FWD}/{selectedFormation.positions.FWD}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formation Grid */}
      <Card>
        <CardContent className="p-6">
          <FormationGrid
            formation={selectedFormation.name}
            players={selectedPlayers}
            onPlayerDrop={(playerId, position) => {
              // Handle drag and drop if needed
            }}
          />
        </CardContent>
      </Card>

      {/* Budget and Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-500">Budget: </span>
              <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                £{currentBudget.toFixed(1)}M / £{maxBudget}M
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Players: </span>
              <span className="font-semibold">{selectedPlayers.length}/11</span>
            </div>
          </div>

          {/* Validation Alerts */}
          {!isValidLineup && selectedPlayers.length === 11 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid formation. Check player positions match the selected formation.
              </AlertDescription>
            </Alert>
          )}

          {isOverBudget && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Over budget by £{(currentBudget - maxBudget).toFixed(1)}M
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleSaveLineup}
            disabled={!isValidLineup || isOverBudget || selectedPlayers.length !== 11}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Fantasy Lineup
          </Button>
        </CardContent>
      </Card>

      {/* Player Selection by Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['GK', 'DEF', 'MID', 'FWD'] as const).map(role => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {role} ({playerCounts[role]}/{selectedFormation.positions[role]})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {getAvailablePlayersByRole(role).slice(0, 10).map(player => (
                <div 
                  key={player.id}
                  className="flex justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePlayerAdd(player)}
                >
                  <div>
                    <div className="font-medium text-sm">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">£{player.price}M</div>
                    <div className="text-xs text-gray-500">{player.points}pts</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedPlayers.map(player => (
                <div 
                  key={player.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {getFantasyRole(player.position)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">£{player.price}M</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePlayerRemove(player.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 