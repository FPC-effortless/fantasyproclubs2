import { useDrop } from "react-dnd"
import { useRef, useEffect } from "react"
import { Player } from "@/types"
import { ArrowRight } from "lucide-react"

interface SubstitutionInterfaceProps {
  players: Player[]
  onSubstitution: (playerOut: Player, playerIn: Player) => void
}

export function SubstitutionInterface({ players, onSubstitution }: SubstitutionInterfaceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "player",
    drop: (item: Player) => {
      // Handle substitution logic here
      const playerOut = players.find((p) => p.isSubstituted)
      if (playerOut) {
        onSubstitution(playerOut, item)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  useEffect(() => {
    drop(ref)
  }, [drop])

  const substitutedPlayers = players.filter((p) => p.isSubstituted)
  const availablePlayers = players.filter((p) => !p.isSubstituted)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Starting XI */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Starting XI</h3>
          <div className="space-y-2">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
              >
                <div>
                  <div className="text-sm text-white">{player.name}</div>
                  <div className="text-xs text-gray-400">
                    {player.team} • {player.position}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#00ff87]">{player.points}</div>
                  <div className="text-xs text-gray-400">{player.form} form</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Substitution Zone */}
        <div
          ref={ref}
          className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed ${
            isOver ? "border-[#00ff87] bg-[#00ff87]/10" : "border-gray-600"
          }`}
        >
          <div className="text-center">
            <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Drag players here to substitute</p>
          </div>
        </div>

        {/* Substitutes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Substitutes</h3>
          <div className="space-y-2">
            {substitutedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
              >
                <div>
                  <div className="text-sm text-white">{player.name}</div>
                  <div className="text-xs text-gray-400">
                    {player.team} • {player.position}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#00ff87]">{player.points}</div>
                  <div className="text-xs text-gray-400">{player.form} form</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
