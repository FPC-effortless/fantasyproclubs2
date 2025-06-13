import { renderHook, act } from '@testing-library/react'
import { useTeamData } from '../useTeamData'
import { useTeamStore } from '@/lib/store/team-store'
import { Team, TeamMember, TeamPerformance } from '@/types/team'

// Mock the team store
jest.mock('@/lib/store/team-store', () => ({
  useTeamStore: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('useTeamData', () => {
  const mockTeam = {
    id: 'team1',
    name: 'Test Team',
    created_at: '2024-01-01',
  }

  const mockTeamMembers = [
    {
      id: 'member1',
      name: 'Player 1',
      position: 'FWD',
    },
    {
      id: 'member2',
      name: 'Player 2',
      position: 'DEF',
    },
  ]

  const mockFixtures = [
    {
      id: 'fixture1',
      home_team: 'Test Team',
      away_team: 'Opponent Team',
      date: '2024-02-01',
    },
  ]

  const mockPerformance = {
    wins: 5,
    losses: 2,
    draws: 1,
    goals_scored: 15,
    goals_conceded: 8,
  }

  const mockStore = {
    team: null,
    teamMembers: [],
    fixtures: [],
    teamPerformance: null,
    isLoading: false,
    error: null,
    setTeam: jest.fn(),
    setTeamMembers: jest.fn(),
    setFixtures: jest.fn(),
    setTeamPerformance: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTeamStore as unknown as jest.Mock).mockReturnValue(mockStore)
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useTeamData('team1'))

    expect(result.current.team).toBeNull()
    expect(result.current.teamMembers).toEqual([])
    expect(result.current.fixtures).toEqual([])
    expect(result.current.teamPerformance).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches team data successfully', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeam),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFixtures),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPerformance),
      })

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setTeam).toHaveBeenCalledWith(mockTeam)
    expect(mockStore.setTeamMembers).toHaveBeenCalledWith(mockTeamMembers)
    expect(mockStore.setFixtures).toHaveBeenCalledWith(mockFixtures)
    expect(mockStore.setTeamPerformance).toHaveBeenCalledWith(mockPerformance)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setError).not.toHaveBeenCalled()
  })

  it('handles team data fetch error', async () => {
    const errorMessage = 'Failed to fetch team data'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    })

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setTeam).not.toHaveBeenCalled()
  })

  it('handles team members fetch error', async () => {
    const errorMessage = 'Failed to fetch team members'
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeam),
      })
      .mockResolvedValueOnce({
        ok: false,
      })

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setTeam).toHaveBeenCalledWith(mockTeam)
    expect(mockStore.setTeamMembers).not.toHaveBeenCalled()
  })

  it('handles fixtures fetch error', async () => {
    const errorMessage = 'Failed to fetch fixtures'
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeam),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
      .mockResolvedValueOnce({
        ok: false,
      })

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setTeam).toHaveBeenCalledWith(mockTeam)
    expect(mockStore.setTeamMembers).toHaveBeenCalledWith(mockTeamMembers)
    expect(mockStore.setFixtures).not.toHaveBeenCalled()
  })

  it('handles performance fetch error', async () => {
    const errorMessage = 'Failed to fetch team performance'
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeam),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFixtures),
      })
      .mockResolvedValueOnce({
        ok: false,
      })

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setTeam).toHaveBeenCalledWith(mockTeam)
    expect(mockStore.setTeamMembers).toHaveBeenCalledWith(mockTeamMembers)
    expect(mockStore.setFixtures).toHaveBeenCalledWith(mockFixtures)
    expect(mockStore.setTeamPerformance).not.toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    const errorMessage = 'Network error'
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useTeamData('team1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage)
    expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    expect(mockStore.setTeam).not.toHaveBeenCalled()
  })
}) 
