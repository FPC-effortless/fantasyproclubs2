import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { User } from '@/types/database'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('useAuth', () => {
  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockSession = {
    user: {
      id: 'user1',
      email: 'test@example.com',
    },
  }

  const mockUnsubscribe = jest.fn()
  const mockSubscription = {
    unsubscribe: mockUnsubscribe,
  }

  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: mockSubscription,
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    })),
  }

  const mockRouter = {
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('initializes with default state', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
  })

  it('loads user data on initial session', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValueOnce({
      data: mockUser,
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles sign in successfully', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn('test@example.com', 'password')
    })

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
    expect(mockRouter.refresh).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('handles sign in error', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const errorMessage = 'Invalid credentials'
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: new Error(errorMessage),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await expect(result.current.signIn('test@example.com', 'password')).rejects.toThrow(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('handles sign up successfully', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'user1' } },
      error: null,
    })

    mockSupabase.from().insert.mockResolvedValueOnce({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp('test@example.com', 'password', { username: 'testuser' })
    })

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
    expect(mockSupabase.from().insert).toHaveBeenCalledWith([
      { id: 'user1', username: 'testuser' },
    ])
    expect(result.current.error).toBeNull()
  })

  it('handles sign up error', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const errorMessage = 'Email already exists'
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      error: new Error(errorMessage),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await expect(result.current.signUp('test@example.com', 'password', { username: 'testuser' }))
        .rejects.toThrow(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('handles sign out successfully', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.auth.signOut.mockResolvedValueOnce({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(mockRouter.refresh).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('handles sign out error', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    const errorMessage = 'Failed to sign out'
    mockSupabase.auth.signOut.mockResolvedValueOnce({
      error: new Error(errorMessage),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await expect(result.current.signOut()).rejects.toThrow(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('handles profile update successfully', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValueOnce({
      data: mockUser,
      error: null,
    })

    mockSupabase.from().update.mockResolvedValueOnce({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    const updates: Partial<User> = { username: 'updateduser' }
    await act(async () => {
      await result.current.updateProfile(updates)
    })

    expect(mockSupabase.from().update).toHaveBeenCalledWith(updates)
    expect(result.current.user).toEqual({ ...mockUser, ...updates })
    expect(result.current.error).toBeNull()
  })

  it('handles profile update error', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValueOnce({
      data: mockUser,
      error: null,
    })

    const errorMessage = 'Failed to update profile'
    mockSupabase.from().update.mockResolvedValueOnce({
      error: new Error(errorMessage),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await expect(result.current.updateProfile({ username: 'updateduser' }))
        .rejects.toThrow(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('handles auth state changes', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    // Simulate auth state change
    const authStateChangeCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0]
    await act(async () => {
      await authStateChangeCallback('SIGNED_IN', mockSession)
    })

    expect(mockSupabase.from().select).toHaveBeenCalledWith('*')
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', mockSession.user.id)
  })

  it('cleans up subscription on unmount', () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
}) 
