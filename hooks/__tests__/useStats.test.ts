import { renderHook, act } from '@testing-library/react'
import { useStats } from '../useStats'
import type { Player, Match } from '@/types/database'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(),
}))

describe('useStats', () => {
  const mockPlayer: Player = {
    id: 'player1',
    team_id: 'team1',
    user_id: 'user1',
    position: 'FWD',
    number: 10,
    status: 'active',
    goals: 10,
    assists: 5,
    cleanSheets: 0,
    yellowCards: 2,
    redCards: 0,
    points: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockMatch: Match = {
    id: 'match1',
    competition_id: 'comp1',
    home_team_id: 'team1',
    away_team_id: 'team2',
    scheduled_time: '2024-01-01T15:00:00Z',
    status: 'completed',
    venue: 'Stadium 1',
    home_team_stats: {
      goals: 2,
      possession: 55,
      shots: 15,
      shots_on_target: 8,
      corners: 6,
      fouls: 10,
      players: {
        'player1': {
          goals: 2,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          position: 'FWD',
        },
      },
    },
    away_team_stats: {
      goals: 1,
      possession: 45,
      shots: 10,
      shots_on_target: 4,
      corners: 4,
      fouls: 12,
      players: {
        'player2': {
          goals: 1,
          assists: 0,
          yellowCards: 1,
          redCards: 0,
          position: 'FWD',
        },
      },
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useStats())

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  describe('getPlayerStats', () => {
    it('fetches player stats successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: mockPlayer,
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
      })

      const { result } = renderHook(() => useStats())

      let playerData
      await act(async () => {
        playerData = await result.current.getPlayerStats('player1')
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(playerData).toEqual(mockPlayer)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('handles fetch error', async () => {
      const errorMessage = 'Failed to fetch player stats'
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error(errorMessage),
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
      })

      const { result } = renderHook(() => useStats())

      await act(async () => {
        await expect(result.current.getPlayerStats('player1')).rejects.toThrow(errorMessage)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('getTeamStats', () => {
    it('fetches team stats successfully', async () => {
      const mockSelect = jest.fn().mockResolvedValueOnce({
        data: [mockPlayer],
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: mockSelect,
      })

      const { result } = renderHook(() => useStats())

      let teamData
      await act(async () => {
        teamData = await result.current.getTeamStats('team1')
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(teamData).toEqual([mockPlayer])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('getMatchStats', () => {
    it('fetches match stats successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: mockMatch,
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
      })

      const { result } = renderHook(() => useStats())

      let matchData
      await act(async () => {
        matchData = await result.current.getMatchStats('match1')
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('matches')
      expect(matchData).toEqual(mockMatch)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('updatePlayerStats', () => {
    it('updates player stats successfully', async () => {
      const updatedStats = { goals: 11 }
      const mockSelect = jest.fn().mockResolvedValueOnce({
        data: { ...mockPlayer, ...updatedStats },
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: mockSelect,
      })

      const { result } = renderHook(() => useStats())

      let updatedPlayer
      await act(async () => {
        updatedPlayer = await result.current.updatePlayerStats('player1', updatedStats)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(updatedPlayer).toEqual({ ...mockPlayer, ...updatedStats })
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('updateMatchStats', () => {
    it('updates match stats successfully', async () => {
      const updatedStats = {
        home_team_stats: {
          goals: 3,
          possession: 55,
          shots: 15,
          shots_on_target: 8,
          corners: 6,
          fouls: 10,
          players: {
            'player1': {
              goals: 2,
              assists: 1,
              yellowCards: 0,
              redCards: 0,
              position: 'FWD' as const,
            },
          },
        },
      }
      const mockSelect = jest.fn().mockResolvedValueOnce({
        data: { ...mockMatch, ...updatedStats },
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: mockSelect,
      })

      const { result } = renderHook(() => useStats())

      let updatedMatch
      await act(async () => {
        updatedMatch = await result.current.updateMatchStats('match1', updatedStats)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('matches')
      expect(updatedMatch).toEqual({ ...mockMatch, ...updatedStats })
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('getTopPerformers', () => {
    it('fetches top scorers successfully', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce({
        data: [mockPlayer],
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit,
      })

      const { result } = renderHook(() => useStats())

      let topScorers
      await act(async () => {
        topScorers = await result.current.getTopScorers()
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(topScorers).toEqual([mockPlayer])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('fetches top assists successfully', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce({
        data: [mockPlayer],
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit,
      })

      const { result } = renderHook(() => useStats())

      let topAssists
      await act(async () => {
        topAssists = await result.current.getTopAssists()
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(topAssists).toEqual([mockPlayer])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('fetches top points successfully', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce({
        data: [mockPlayer],
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit,
      })

      const { result } = renderHook(() => useStats())

      let topPoints
      await act(async () => {
        topPoints = await result.current.getTopPoints()
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('players')
      expect(topPoints).toEqual([mockPlayer])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('calculatePlayerPoints', () => {
    it('calculates points for a striker correctly', () => {
      const { result } = renderHook(() => useStats())
      const points = result.current.calculatePlayerPoints(mockPlayer)

      // Goals (10 * 4) + Assists (5 * 3) - Yellow Cards (2 * 1) = 40 + 15 - 2 = 53
      expect(points).toBe(53)
    })

    it('calculates points for a defender with clean sheets', () => {
      const { result } = renderHook(() => useStats())
      const defenderStats: Player = {
        ...mockPlayer,
        position: 'DEF',
        goals: 2,
        assists: 3,
        cleanSheets: 5,
        yellowCards: 1,
      }
      const points = result.current.calculatePlayerPoints(defenderStats)

      // Goals (2 * 4) + Assists (3 * 3) + Clean Sheets (5 * 4) - Yellow Cards (1 * 1) = 8 + 9 + 20 - 1 = 36
      expect(points).toBe(36)
    })

    it('calculates points for a midfielder with clean sheets', () => {
      const { result } = renderHook(() => useStats())
      const midfielderStats: Player = {
        ...mockPlayer,
        position: 'MID',
        goals: 5,
        assists: 7,
        cleanSheets: 3,
        yellowCards: 2,
      }
      const points = result.current.calculatePlayerPoints(midfielderStats)

      // Goals (5 * 4) + Assists (7 * 3) + Clean Sheets (3 * 1) - Yellow Cards (2 * 1) = 20 + 21 + 3 - 2 = 42
      expect(points).toBe(42)
    })

    it('calculates points with red card penalty', () => {
      const { result } = renderHook(() => useStats())
      const playerWithRedCard: Player = {
        ...mockPlayer,
        redCards: 1,
      }
      const points = result.current.calculatePlayerPoints(playerWithRedCard)

      // Goals (10 * 4) + Assists (5 * 3) - Yellow Cards (2 * 1) - Red Card (1 * 3) = 40 + 15 - 2 - 3 = 50
      expect(points).toBe(50)
    })
  })
}) 
