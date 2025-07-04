"use client"

import { Fixture } from "@/types/match"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FixturesListProps {
  fixtures: Fixture[]
  onFixtureClick?: (fixture: Fixture) => void
}

export function FixturesList({ fixtures, onFixtureClick }: FixturesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: Fixture["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-500"
      case "live":
        return "bg-green-500/20 text-green-500"
      case "completed":
        return "bg-gray-500/20 text-gray-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fixtures.map((fixture) => (
        <Card
          key={fixture.id}
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => onFixtureClick?.(fixture)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{fixture.competition}</CardTitle>
            <Badge variant="secondary" className={cn("capitalize", getStatusColor(fixture.status))}>
              {fixture.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {fixture.isHome ? "vs" : "@"} {fixture.opponent}
                </div>
                {fixture.result && <div className="font-bold">{fixture.result}</div>}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(fixture.date)}</span>
                <span>•</span>
                <span>{formatTime(fixture.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{fixture.venue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 