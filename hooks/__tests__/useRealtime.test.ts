import { renderHook, act } from '@testing-library/react'
import { useRealtime } from '../useRealtime'
import { createClient } from "@/lib/supabase/client"
import { RealtimeChannel } from '@supabase/supabase-js'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

describe('useRealtime', () => {
  const mockChannel = {
    unsubscribe: jest.fn(),
  } as unknown as RealtimeChannel

  const mockSupabase = {
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue(mockChannel),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('subscribes to a table', () => {
    const { result } = renderHook(() => useRealtime())

    const callback = jest.fn()
    const subscription = {
      table: 'players',
      event: 'INSERT' as const,
      callback,
    }

    act(() => {
      result.current.subscribe(subscription)
    })

    expect(mockSupabase.channel).toHaveBeenCalledWith('players_changes')
    expect(mockSupabase.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
      },
      callback
    )
    expect(mockSupabase.subscribe).toHaveBeenCalled()
  })

  it('unsubscribes from a channel', () => {
    const { result } = renderHook(() => useRealtime())

    const callback = jest.fn()
    const subscription = {
      table: 'players',
      event: 'INSERT' as const,
      callback,
    }

    let channel: RealtimeChannel
    act(() => {
      channel = result.current.subscribe(subscription)
    })

    act(() => {
      result.current.unsubscribe(channel)
    })

    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })

  it('unsubscribes from all channels', () => {
    const { result } = renderHook(() => useRealtime())

    const callback1 = jest.fn()
    const callback2 = jest.fn()

    act(() => {
      result.current.subscribe({
        table: 'players',
        event: 'INSERT' as const,
        callback: callback1,
      })
      result.current.subscribe({
        table: 'teams',
        event: 'UPDATE' as const,
        callback: callback2,
      })
    })

    act(() => {
      result.current.unsubscribeAll()
    })

    expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes from all channels on unmount', () => {
    const { result, unmount } = renderHook(() => useRealtime())

    const callback = jest.fn()
    act(() => {
      result.current.subscribe({
        table: 'players',
        event: 'INSERT' as const,
        callback,
      })
    })

    unmount()

    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })

  it('handles multiple subscriptions to the same table', () => {
    const { result } = renderHook(() => useRealtime())

    const callback1 = jest.fn()
    const callback2 = jest.fn()

    act(() => {
      result.current.subscribe({
        table: 'players',
        event: 'INSERT' as const,
        callback: callback1,
      })
      result.current.subscribe({
        table: 'players',
        event: 'UPDATE' as const,
        callback: callback2,
      })
    })

    expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
    expect(mockSupabase.channel).toHaveBeenCalledWith('players_changes')
  })

  it('handles different event types', () => {
    const { result } = renderHook(() => useRealtime())

    const callback = jest.fn()
    const subscription = {
      table: 'players',
      event: 'DELETE' as const,
      callback,
    }

    act(() => {
      result.current.subscribe(subscription)
    })

    expect(mockSupabase.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'players',
      },
      callback
    )
  })
}) 
