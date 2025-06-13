import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast } from '../use-toast'

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes with empty toasts', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.toasts).toEqual([])
  })

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'This is a test toast',
      open: true,
    })
  })

  it('updates a toast', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      })
      toastId = id
    })

    act(() => {
      result.current.toast({
        title: 'Updated Toast',
        description: 'This is an updated toast',
      })
    })

    expect(result.current.toasts[0]).toMatchObject({
      title: 'Updated Toast',
      description: 'This is an updated toast',
    })
  })

  it('dismisses a specific toast', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      })
      toastId = id
    })

    act(() => {
      result.current.dismiss(toastId)
    })

    expect(result.current.toasts[0].open).toBe(false)

    // Fast-forward timers to trigger removal
    act(() => {
      jest.advanceTimersByTime(1000000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('dismisses all toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast 1',
        description: 'This is test toast 1',
      })
      result.current.toast({
        title: 'Test Toast 2',
        description: 'This is test toast 2',
      })
    })

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toasts).toHaveLength(2)
    expect(result.current.toasts[0].open).toBe(false)
    expect(result.current.toasts[1].open).toBe(false)

    // Fast-forward timers to trigger removal
    act(() => {
      jest.advanceTimersByTime(1000000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('limits the number of toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast 1',
        description: 'This is test toast 1',
      })
      result.current.toast({
        title: 'Test Toast 2',
        description: 'This is test toast 2',
      })
      result.current.toast({
        title: 'Test Toast 3',
        description: 'This is test toast 3',
      })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast 3')
  })

  it('cleans up listeners on unmount', () => {
    const { unmount } = renderHook(() => useToast())

    unmount()

    // Add a new toast after unmount
    act(() => {
      toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      })
    })

    // Render a new instance
    const { result } = renderHook(() => useToast())

    // The new instance should not have the toast from before
    expect(result.current.toasts).toHaveLength(0)
  })
}) 
