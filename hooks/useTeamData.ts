import { useEffect } from "react"
import { useTeamStore } from "@/lib/store/team-store"

export function useTeamData(teamId: string) {
  const {
    team,
    teamMembers,
    fixtures,
    teamPerformance,
    isLoading,
    error,
    setTeam,
    setTeamMembers,
    setFixtures,
    setTeamPerformance,
    setLoading,
    setError,
  } = useTeamStore()

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch team data
        const teamResponse = await fetch(`/api/teams/${teamId}`)
        if (!teamResponse.ok) throw new Error("Failed to fetch team data")
        const teamData = await teamResponse.json()
        setTeam(teamData)

        // Fetch team members
        const membersResponse = await fetch(`/api/teams/${teamId}/members`)
        if (!membersResponse.ok) throw new Error("Failed to fetch team members")
        const membersData = await membersResponse.json()
        setTeamMembers(membersData)

        // Fetch fixtures
        const fixturesResponse = await fetch(`/api/teams/${teamId}/fixtures`)
        if (!fixturesResponse.ok) throw new Error("Failed to fetch fixtures")
        const fixturesData = await fixturesResponse.json()
        setFixtures(fixturesData)

        // Fetch team performance
        const performanceResponse = await fetch(`/api/teams/${teamId}/performance`)
        if (!performanceResponse.ok) throw new Error("Failed to fetch team performance")
        const performanceData = await performanceResponse.json()
        setTeamPerformance(performanceData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [teamId, setTeam, setTeamMembers, setFixtures, setTeamPerformance, setLoading, setError])

  return {
    team,
    teamMembers,
    fixtures,
    teamPerformance,
    isLoading,
    error,
  }
} 
