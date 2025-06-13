"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTouchGestures } from "@/hooks/use-touch-gestures"

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  swipeThreshold?: number
  swipeDistance?: number
}

export function MobileCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onDoubleTap,
  swipeThreshold = 50,
  swipeDistance = 100,
}: MobileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const { bindTouchEvents } = useTouchGestures({
    onSwipe: (direction, distance) => {
      if (direction === 'left' && onSwipeLeft) {
        controls.start({ x: -swipeDistance, opacity: 0 })
        setTimeout(onSwipeLeft, 300)
      } else if (direction === 'right' && onSwipeRight) {
        controls.start({ x: swipeDistance, opacity: 0 })
        setTimeout(onSwipeRight, 300)
      }
    },
    onTap,
    onDoubleTap,
    swipeThreshold,
  })

  useEffect(() => {
    return bindTouchEvents(cardRef.current)
  }, [bindTouchEvents])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden",
        "touch-manipulation select-none",
        className
      )}
      animate={controls}
      initial={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
} 
