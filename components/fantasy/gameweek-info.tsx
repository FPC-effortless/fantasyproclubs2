import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Trophy } from "lucide-react"

interface GameweekInfoProps {
  currentGameweek: number
  nextGameweek: number
  deadline: string
  isLoading: boolean
}

export default function GameweekInfo({
  currentGameweek,
  nextGameweek,
  deadline,
  isLoading
}: GameweekInfoProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gameweek Info</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          Season 1
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Current Gameweek</p>
              <p className="text-sm text-muted-foreground">
                Gameweek {currentGameweek}
              </p>
            </div>
          </div>
          <Badge variant="outline">Active</Badge>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Next Gameweek</p>
              <p className="text-sm text-muted-foreground">
                Gameweek {nextGameweek}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">Deadline</p>
            <p className="text-sm text-muted-foreground">{deadline}</p>
          </div>
        </div>

        <Button className="w-full" variant="outline">
          View Fixtures
        </Button>
      </div>
    </Card>
  )
} 