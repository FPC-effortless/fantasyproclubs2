"use client"

import { useParams } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Loading } from "@/components/loading"
import { ManagerProfileScreen } from "@/features/manager/components/ManagerProfileScreen"
import { useTeamData } from "@/hooks/useTeamData"

export default function DashboardPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { team, teamMembers, fixtures, teamPerformance, isLoading, error } = useTeamData(teamId)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!team || !teamPerformance) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Team not found</h2>
          <p className="text-sm text-muted-foreground">The requested team could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ManagerProfileScreen
        team={team}
        teamMembers={teamMembers}
        fixtures={fixtures}
        teamPerformance={teamPerformance}
        onEditProfile={() => {
          // Handle edit profile
        }}
        onMemberClick={(member) => {
          // Handle member click
        }}
        onFixtureClick={(fixture) => {
          // Handle fixture click
        }}
      />
    </ErrorBoundary>
  )
} 