import { Calendar, Users, Trophy, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { Competition } from "@/types"

interface CompetitionCardProps {
  competition: Competition
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30"
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-[#00ff87]/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-white">{competition.name}</CardTitle>
          <Badge className={getStatusColor(competition.status)}>{competition.status}</Badge>
        </div>
        <p className="text-sm text-gray-400 capitalize">{competition.type}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>
            {competition.teams_count || 0} / {competition.max_teams} teams
          </span>
        </div>

        {competition.is_fantasy_enabled && (
          <div className="flex items-center space-x-2 text-sm text-[#00ff87]">
            <Trophy className="h-4 w-4" />
            <span>Fantasy Enabled</span>
          </div>
        )}

        {competition.stream_link && (
          <div className="flex items-center space-x-2 text-sm text-[#00ff87]">
            <ExternalLink className="h-4 w-4" />
            <span>Stream Available</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
