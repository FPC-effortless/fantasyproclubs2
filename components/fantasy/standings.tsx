import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Medal, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StandingsProps {
  standings: any[]
  isLoading: boolean
}

export default function Standings({ standings, isLoading }: StandingsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Standings</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          Season 1
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {standings.map((standing, index) => (
            <div
              key={standing.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {index < 3 ? (
                    <Medal className={cn(
                      "h-5 w-5",
                      index === 0 && "text-yellow-500",
                      index === 1 && "text-gray-400",
                      index === 2 && "text-amber-600"
                    )} />
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{standing.team_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {standing.manager_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{standing.points}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
                <div className="flex items-center gap-1">
                  {standing.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : standing.trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={cn(
                    "text-sm",
                    standing.trend > 0 && "text-green-500",
                    standing.trend < 0 && "text-red-500"
                  )}>
                    {Math.abs(standing.trend)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
} 