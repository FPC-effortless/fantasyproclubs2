import { renderHook, act } from '@testing-library/react'
import { useTeamStore } from '../team-store'
import { Team, TeamMember, TeamPerformance } from '@/types/team'
import { Fixture } from '@/types/match'

describe('useTeamStore', () => {
  const mockTeam: Team = {
    id: '1',
    name: 'Test Team',
    logoUrl: 'https://example.com/logo.png',
    shortName: 'TT',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    foundedDate: '2024-01-01',
    homeVenue: 'Test Stadium',
  }

  const mockTeamMember: TeamMember = {
    id: '1',
    name: 'Test Player',
    position: 'ST',
    jerseyNumber: 10,
    role: 'player',
    matchesPlayed: 10,
    goals: 5,
    assists: 3,
    rating: 8.5,
    status: 'active',
  }

  const mockFixture: Fixture = {
    id: '1',
    date: '2024-01-01',
    opponent: 'Team B',
    competition: 'Premier League',
    venue: 'Test Stadium',
    isHome: true,
    status: 'upcoming',
  }

  const mockTeamPerformance: TeamPerformance = {
    wins: 5,
    draws: 2,
    losses: 3,
    goalsFor: 20,
    goalsAgainst: 15,
    cleanSheets: 3,
    points: 17,
    position: 2,
    form: ['W', 'W', 'L', 'D', 'W'],
    recentResults: [
      {
        opponent: 'Team A',
        result: 'W',
        score: '3-1',
      },
    ],
    performanceData: [
      {
        match: 1,
        goalsFor: 3,
        goalsAgainst: 1,
      },
    ],
  }

  beforeEach(() => {
    const { result } = renderHook(() => useTeamStore())
    act(() => {
      result.current.setTeam(mockTeam)
      result.current.setTeamMembers([])
      result.current.setFixtures([])
      result.current.setTeamPerformance(mockTeamPerformance)
      result.current.setLoading(false)
      result.current.setError(null)
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useTeamStore())

    expect(result.current.team).toBeNull()
    expect(result.current.teamMembers).toEqual([])
    expect(result.current.fixtures).toEqual([])
    expect(result.current.teamPerformance).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('updates team state', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setTeam(mockTeam)
    })

    expect(result.current.team).toEqual(mockTeam)
  })

  it('updates team members state', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setTeamMembers([mockTeamMember])
    })

    expect(result.current.teamMembers).toEqual([mockTeamMember])
  })

  it('updates fixtures state', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setFixtures([mockFixture])
    })

    expect(result.current.fixtures).toEqual([mockFixture])
  })

  it('updates team performance state', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setTeamPerformance(mockTeamPerformance)
    })

    expect(result.current.teamPerformance).toEqual(mockTeamPerformance)
  })

  it('updates loading state', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('updates error state', () => {
    const { result } = renderHook(() => useTeamStore())
    const errorMessage = 'Test error'

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('updates team member', () => {
    const { result } = renderHook(() => useTeamStore())
    const updatedMember: TeamMember = {
      ...mockTeamMember,
      name: 'Updated Player',
    }

    act(() => {
      result.current.setTeamMembers([mockTeamMember])
      result.current.updateTeamMember(updatedMember)
    })

    expect(result.current.teamMembers).toEqual([updatedMember])
  })

  it('adds team member', () => {
    const { result } = renderHook(() => useTeamStore())
    const newMember: TeamMember = {
      ...mockTeamMember,
      id: '2',
      name: 'New Player',
    }

    act(() => {
      result.current.setTeamMembers([mockTeamMember])
      result.current.addTeamMember(newMember)
    })

    expect(result.current.teamMembers).toEqual([mockTeamMember, newMember])
  })

  it('removes team member', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setTeamMembers([mockTeamMember])
      result.current.removeTeamMember(mockTeamMember.id)
    })

    expect(result.current.teamMembers).toEqual([])
  })

  it('updates fixture', () => {
    const { result } = renderHook(() => useTeamStore())
    const updatedFixture: Fixture = {
      ...mockFixture,
      status: 'completed',
      result: '2-1',
    }

    act(() => {
      result.current.setFixtures([mockFixture])
      result.current.updateFixture(updatedFixture)
    })

    expect(result.current.fixtures).toEqual([updatedFixture])
  })

  it('adds fixture', () => {
    const { result } = renderHook(() => useTeamStore())
    const newFixture: Fixture = {
      ...mockFixture,
      id: '2',
      date: '2024-01-02',
    }

    act(() => {
      result.current.setFixtures([mockFixture])
      result.current.addFixture(newFixture)
    })

    expect(result.current.fixtures).toEqual([mockFixture, newFixture])
  })

  it('removes fixture', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setFixtures([mockFixture])
      result.current.removeFixture(mockFixture.id)
    })

    expect(result.current.fixtures).toEqual([])
  })

  it('maintains state between renders', () => {
    const { result, rerender } = renderHook(() => useTeamStore())

    act(() => {
      result.current.setTeam(mockTeam)
      result.current.setTeamMembers([mockTeamMember])
      result.current.setFixtures([mockFixture])
      result.current.setTeamPerformance(mockTeamPerformance)
    })

    rerender()

    expect(result.current.team).toEqual(mockTeam)
    expect(result.current.teamMembers).toEqual([mockTeamMember])
    expect(result.current.fixtures).toEqual([mockFixture])
    expect(result.current.teamPerformance).toEqual(mockTeamPerformance)
  })
}) 
