import { useState, useCallback, useRef, useEffect } from 'react'

interface TouchGestureOptions {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPullToRefresh?: (progress: number) => void
  onPullToRefreshComplete?: () => void
  swipeThreshold?: number
  doubleTapDelay?: number
  longPressDelay?: number
  pullToRefreshThreshold?: number
}

interface TouchState {
  startX: number
  startY: number
  lastX: number
  lastY: number
  startDistance?: number
  lastTap?: number
  longPressTimer?: NodeJS.Timeout
  isPulling?: boolean
  pullStartY?: number
}

export function useTouchGestures({
  onSwipe,
  onPinch,
  onTap,
  onDoubleTap,
  onLongPress,
  onPullToRefresh,
  onPullToRefreshComplete,
  swipeThreshold = 50,
  doubleTapDelay = 300,
  longPressDelay = 500,
  pullToRefreshThreshold = 100,
}: TouchGestureOptions = {}) {
  const [isTouching, setIsTouching] = useState(false)
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  })

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[1].clientX - touches[0].clientX
    const dy = touches[1].clientY - touches[0].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsTouching(true)
    const touch = e.touches[0]
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      startDistance: e.touches.length > 1 ? getDistance(e.touches) : undefined,
      pullStartY: touch.clientY,
    }

    // Handle double tap
    const now = Date.now()
    if (touchState.current.lastTap && now - touchState.current.lastTap < doubleTapDelay) {
      onDoubleTap?.()
      touchState.current.lastTap = undefined
    } else {
      touchState.current.lastTap = now
    }

    // Start long press timer
    if (onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }, [getDistance, onDoubleTap, onLongPress, doubleTapDelay, longPressDelay])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching) return

    const touch = e.touches[0]
    const { startX, startY, lastX, lastY, startDistance, pullStartY } = touchState.current

    // Clear long press timer if moved
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer)
      touchState.current.longPressTimer = undefined
    }

    // Handle pull to refresh
    if (pullStartY !== undefined && onPullToRefresh) {
      const scrollTop = window.scrollY
      if (scrollTop <= 0) {
        const pullDistance = touch.clientY - pullStartY
        if (pullDistance > 0) {
          touchState.current.isPulling = true
          const progress = Math.min(pullDistance / pullToRefreshThreshold, 1)
          onPullToRefresh(progress)
        }
      }
    }

    // Handle pinch
    if (e.touches.length > 1 && startDistance) {
      const currentDistance = getDistance(e.touches)
      const scale = currentDistance / startDistance
      onPinch?.(scale)
      return
    }

    // Handle swipe
    const dx = touch.clientX - startX
    const dy = touch.clientY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > swipeThreshold) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      let direction: 'left' | 'right' | 'up' | 'down'

      if (angle > -45 && angle <= 45) direction = 'right'
      else if (angle > 45 && angle <= 135) direction = 'down'
      else if (angle > 135 || angle <= -135) direction = 'left'
      else direction = 'up'

      onSwipe?.(direction, distance)
      setIsTouching(false)
    }

    touchState.current.lastX = touch.clientX
    touchState.current.lastY = touch.clientY
  }, [isTouching, onPinch, onSwipe, onPullToRefresh, swipeThreshold, pullToRefreshThreshold])

  const handleTouchEnd = useCallback(() => {
    if (!isTouching) return

    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer)
      touchState.current.longPressTimer = undefined
    }

    // Handle pull to refresh completion
    if (touchState.current.isPulling) {
      onPullToRefreshComplete?.()
      touchState.current.isPulling = false
    }

    const { startX, startY, lastX, lastY } = touchState.current
    const dx = lastX - startX
    const dy = lastY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If the touch didn't move much, it's a tap
    if (distance < 10) {
      onTap?.()
    }

    setIsTouching(false)
  }, [isTouching, onTap, onPullToRefreshComplete])

  const bindTouchEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isTouching,
    bindTouchEvents,
  }
} 
