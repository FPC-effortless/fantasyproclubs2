import { renderHook, act } from '@testing-library/react'
import { useCompetitions } from '../use-competitions'
import { supabase } from '@/lib/supabase'
import type { Competition } from '@/types/database'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })),
  },
}))

describe('useCompetitions', () => {
  const mockCompetitions: Competition[] = [
    {
      id: 'comp1',
      name: 'Premier League',
      description: 'Top tier football league',
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
      id: 'comp2',
      name: 'FA Cup',
      description: 'National cup competition',
      type: 'cup',
      status: 'upcoming',
      start_date: '2024-02-01',
      end_date: '2024-06-30',
      max_teams: 64,
      entry_fee: 500,
      prize_pool: 50000,
      rules: 'Cup competition rules',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCompetitions())

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('fetches competitions successfully', async () => {
    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: mockCompetitions,
      error: null,
    })

    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: mockOrder,
    })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(supabase.from).toHaveBeenCalledWith('competitions')
    expect(result.current.competitions).toEqual(mockCompetitions)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles empty data response', async () => {
    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    })

    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: mockOrder,
    })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch competitions'
    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: null,
      error: new Error(errorMessage),
    })

    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: mockOrder,
    })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles network error', async () => {
    const errorMessage = 'Network error'
    const mockOrder = jest.fn().mockRejectedValueOnce(new Error(errorMessage))

    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: mockOrder,
    })

    const { result } = renderHook(() => useCompetitions())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.competitions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })
}) 
