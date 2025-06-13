import { create } from "zustand"
import { Team, TeamMember, TeamPerformance } from "@/types/team"
import { Fixture } from "@/types/match"

interface TeamState {
  team: Team | null
  teamMembers: TeamMember[]
  fixtures: Fixture[]
  teamPerformance: TeamPerformance | null
  isLoading: boolean
  error: string | null
  setTeam: (team: Team) => void
  setTeamMembers: (members: TeamMember[]) => void
  setFixtures: (fixtures: Fixture[]) => void
  setTeamPerformance: (performance: TeamPerformance) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  updateTeamMember: (member: TeamMember) => void
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (memberId: string) => void
  updateFixture: (fixture: Fixture) => void
  addFixture: (fixture: Fixture) => void
  removeFixture: (fixtureId: string) => void
}

type TeamStore = {
  state: TeamState
  setState: (state: Partial<TeamState>) => void
}

export const useTeamStore = create<TeamState>((set: (fn: (state: TeamState) => Partial<TeamState>) => void) => ({
  team: null,
  teamMembers: [],
  fixtures: [],
  teamPerformance: null,
  isLoading: false,
  error: null,

  setTeam: (team: Team) => set(() => ({ team })),
  setTeamMembers: (members: TeamMember[]) => set(() => ({ teamMembers: members })),
  setFixtures: (fixtures: Fixture[]) => set(() => ({ fixtures })),
  setTeamPerformance: (performance: TeamPerformance) => set(() => ({ teamPerformance: performance })),
  setLoading: (isLoading: boolean) => set(() => ({ isLoading })),
  setError: (error: string | null) => set(() => ({ error })),

  updateTeamMember: (member: TeamMember) =>
    set((state: TeamState) => ({
      teamMembers: state.teamMembers.map((m) => (m.id === member.id ? member : m)),
    })),

  addTeamMember: (member: TeamMember) =>
    set((state: TeamState) => ({
      teamMembers: [...state.teamMembers, member],
    })),

  removeTeamMember: (memberId: string) =>
    set((state: TeamState) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== memberId),
    })),

  updateFixture: (fixture: Fixture) =>
    set((state: TeamState) => ({
      fixtures: state.fixtures.map((f) => (f.id === fixture.id ? fixture : f)),
    })),

  addFixture: (fixture: Fixture) =>
    set((state: TeamState) => ({
      fixtures: [...state.fixtures, fixture],
    })),

  removeFixture: (fixtureId: string) =>
    set((state: TeamState) => ({
      fixtures: state.fixtures.filter((f) => f.id !== fixtureId),
    })),
})) 
