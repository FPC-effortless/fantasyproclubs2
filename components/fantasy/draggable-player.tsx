import { useDrag } from "react-dnd"
import { useRef, useEffect } from "react"
import { Player } from "@/types"

interface DraggablePlayerProps {
  player: Player
}

export function DraggablePlayer({ player }: DraggablePlayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "player",
    item: player,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  useEffect(() => {
    drag(ref)
  }, [drag])

  return (
    <div
      ref={ref}
      className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-move hover:bg-gray-800 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div>
        <div className="text-white font-medium">{player.name}</div>
        <div className="text-sm text-gray-400">
          {player.team} • {player.position} • £{player.price}M
        </div>
      </div>
      <div className="text-right">
        <div className="text-[#00ff87] font-medium">{player.points}</div>
        <div className="text-xs text-gray-400">{player.form} form</div>
      </div>
    </div>
  )
} 
