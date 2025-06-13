import { renderHook, act } from '@testing-library/react'
import { useFantasy } from '../useFantasy'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FantasyTeam } from '@/types/database'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

describe('useFantasy', () => {
  const mockFantasyTeams: FantasyTeam[] = [
    {
      id: '1',
      user_id: 'user1',
      competition_id: 'comp1',
      name: 'Team Alpha',
      points: 100,
      budget: 1000000,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      user_id: 'user2',
      competition_id: 'comp1',
      name: 'Team Beta',
      points: 90,
      budget: 950000,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ]

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useFantasy())

    expect(result.current.fantasyTeams).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('fetches fantasy teams on mount', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockFantasyTeams, error: null })

    const { result } = renderHook(() => useFantasy())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.fantasyTeams).toEqual(mockFantasyTeams)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors', async () => {
    const errorMessage = 'Failed to fetch fantasy teams'
    mockSupabase.select.mockResolvedValueOnce({ data: null, error: new Error(errorMessage) })

    const { result } = renderHook(() => useFantasy())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.fantasyTeams).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('gets a single fantasy team', async () => {
    const mockTeam = mockFantasyTeams[0]
    mockSupabase.select.mockResolvedValueOnce({ data: mockTeam, error: null })

    const { result } = renderHook(() => useFantasy())

    let team
    await act(async () => {
      team = await result.current.getFantasyTeam('1')
    })

    expect(team).toEqual(mockTeam)
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('creates a new fantasy team', async () => {
    const newTeam = {
      user_id: 'user3',
      competition_id: 'comp1',
      name: 'Team Gamma',
      points: 0,
      budget: 1000000,
    }
    mockSupabase.insert.mockResolvedValueOnce({ data: { ...newTeam, id: '3' }, error: null })

    const { result } = renderHook(() => useFantasy())

    let createdTeam
    await act(async () => {
      createdTeam = await result.current.createFantasyTeam(newTeam)
    })

    expect(createdTeam).toEqual({ ...newTeam, id: '3' })
    expect(mockSupabase.insert).toHaveBeenCalledWith([newTeam])
  })

  it('updates a fantasy team', async () => {
    const updates = {
      name: 'Updated Team',
      points: 110,
    }
    mockSupabase.update.mockResolvedValueOnce({ data: { ...mockFantasyTeams[0], ...updates }, error: null })

    const { result } = renderHook(() => useFantasy())

    let updatedTeam
    await act(async () => {
      updatedTeam = await result.current.updateFantasyTeam('1', updates)
    })

    expect(updatedTeam).toEqual({ ...mockFantasyTeams[0], ...updates })
    expect(mockSupabase.update).toHaveBeenCalledWith(updates)
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('deletes a fantasy team', async () => {
    mockSupabase.delete.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useFantasy())

    await act(async () => {
      await result.current.deleteFantasyTeam('1')
    })

    expect(mockSupabase.delete).toHaveBeenCalled()
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('gets user fantasy teams', async () => {
    const userTeams = [mockFantasyTeams[0]]
    mockSupabase.select.mockResolvedValueOnce({ data: userTeams, error: null })

    const { result } = renderHook(() => useFantasy())

    let teams
    await act(async () => {
      teams = await result.current.getUserFantasyTeams('user1')
    })

    expect(teams).toEqual(userTeams)
    expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user1')
  })

  it('gets competition fantasy teams', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockFantasyTeams, error: null })

    const { result } = renderHook(() => useFantasy())

    let teams
    await act(async () => {
      teams = await result.current.getCompetitionFantasyTeams('comp1')
    })

    expect(teams).toEqual(mockFantasyTeams)
    expect(mockSupabase.eq).toHaveBeenCalledWith('competition_id', 'comp1')
  })

  it('gets top fantasy teams', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockFantasyTeams, error: null })

    const { result } = renderHook(() => useFantasy())

    await act(async () => {
      await Promise.resolve()
    })

    const topTeams = result.current.getTopFantasyTeams(1)
    expect(topTeams).toEqual([mockFantasyTeams[0]])
  })

  it('subscribes to fantasy team changes', async () => {
    const { result } = renderHook(() => useFantasy())

    // Simulate a new team being added
    const newTeam = {
      id: '3',
      user_id: 'user3',
      competition_id: 'comp1',
      name: 'Team Gamma',
      points: 0,
      budget: 1000000,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    await act(async () => {
      const subscription = mockSupabase.on.mock.calls[0][1]
      subscription({
        eventType: 'INSERT',
        new: newTeam,
      })
    })

    expect(result.current.fantasyTeams).toContainEqual(newTeam)
  })

  it('unsubscribes from fantasy team changes on unmount', () => {
    const unsubscribe = jest.fn()
    mockSupabase.subscribe.mockReturnValue({ unsubscribe })

    const { unmount } = renderHook(() => useFantasy())

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
}) 
