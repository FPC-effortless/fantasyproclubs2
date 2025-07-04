import { renderHook, act } from '@testing-library/react'
import { useCompetitions } from '../useCompetitions'
import { Competition } from '@/types/database'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

describe('useCompetitions', () => {
  const mockCompetitions: Competition[] = [
    {
      id: '1',
      name: 'Premier League',
      description: 'Top tier competition',
      type: 'league',
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2024-05-31',
      max_teams: 20,
      entry_fee: 1000,
      prize_pool: 100000,
      rules: 'Standard league rules',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      name: 'Champions League',
      description: 'European competition',
      type: 'cup',
      status: 'upcoming',
      start_date: '2024-02-01',
      end_date: '2024-06-30',
      max_teams: 32,
      entry_fee: 2000,
      prize_pool: 200000,
      rules: 'European cup rules',
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCompetitions())

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('fetches competitions on mount', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockCompetitions, error: null })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.competitions).toEqual(mockCompetitions)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors', async () => {
    const errorMessage = 'Failed to fetch competitions'
    mockSupabase.select.mockResolvedValueOnce({ data: null, error: new Error(errorMessage) })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('gets a single competition', async () => {
    const mockCompetition = mockCompetitions[0]
    mockSupabase.select.mockResolvedValueOnce({ data: mockCompetition, error: null })

    const { result } = renderHook(() => useCompetitions())

    let competition
    await act(async () => {
      competition = await result.current.getCompetition('1')
    })

    expect(competition).toEqual(mockCompetition)
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('creates a new competition', async () => {
    const newCompetition = {
      name: 'New League',
      description: 'New competition',
      type: 'league' as const,
      status: 'upcoming' as const,
      start_date: '2024-03-01',
      end_date: '2024-07-31',
      max_teams: 16,
      entry_fee: 1500,
      prize_pool: 150000,
      rules: 'New competition rules',
    }
    mockSupabase.insert.mockResolvedValueOnce({ data: { ...newCompetition, id: '3' }, error: null })

    const { result } = renderHook(() => useCompetitions())

    let createdCompetition
    await act(async () => {
      createdCompetition = await result.current.createCompetition(newCompetition)
    })

    expect(createdCompetition).toEqual({ ...newCompetition, id: '3' })
    expect(mockSupabase.insert).toHaveBeenCalledWith([newCompetition])
  })

  it('updates a competition', async () => {
    const updates = {
      name: 'Updated League',
      status: 'active' as const,
    }
    mockSupabase.update.mockResolvedValueOnce({ data: { ...mockCompetitions[0], ...updates }, error: null })

    const { result } = renderHook(() => useCompetitions())

    let updatedCompetition
    await act(async () => {
      updatedCompetition = await result.current.updateCompetition('1', updates)
    })

    expect(updatedCompetition).toEqual({ ...mockCompetitions[0], ...updates })
    expect(mockSupabase.update).toHaveBeenCalledWith(updates)
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('deletes a competition', async () => {
    mockSupabase.delete.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await result.current.deleteCompetition('1')
    })

    expect(mockSupabase.delete).toHaveBeenCalled()
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('filters active competitions', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockCompetitions, error: null })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    const activeCompetitions = result.current.getActiveCompetitions()
    expect(activeCompetitions).toEqual([mockCompetitions[0]])
  })

  it('filters upcoming competitions', async () => {
    mockSupabase.select.mockResolvedValueOnce({ data: mockCompetitions, error: null })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    const upcomingCompetitions = result.current.getUpcomingCompetitions()
    expect(upcomingCompetitions).toEqual([mockCompetitions[1]])
  })

  it('filters completed competitions', async () => {
    const completedCompetition = {
      ...mockCompetitions[0],
      status: 'completed' as const,
    }
    mockSupabase.select.mockResolvedValueOnce({ data: [completedCompetition], error: null })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    const completedCompetitions = result.current.getCompletedCompetitions()
    expect(completedCompetitions).toEqual([completedCompetition])
  })
}) 
