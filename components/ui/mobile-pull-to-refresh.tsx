"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { RefreshCw } from "lucide-react"

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>
  className?: string
  children: React.ReactNode
  pullDistance?: number
  refreshDelay?: number
}

export function MobilePullToRefresh({
  onRefresh,
  className,
  children,
  pullDistance = 100,
  refreshDelay = 1000,
}: MobilePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      // Add a minimum delay to show the refresh animation
      await new Promise(resolve => setTimeout(resolve, refreshDelay))
      setIsRefreshing(false)
      setPullProgress(0)
    }
  }

  const { bindTouchEvents } = useTouchGestures({
    onPullToRefresh: (progress) => {
      setPullProgress(progress)
      controls.start({ y: progress * pullDistance })
    },
    onPullToRefreshComplete: async () => {
      if (pullProgress >= 0.8) {
        await handleRefresh()
      }
      controls.start({ y: 0 })
    },
    pullToRefreshThreshold: pullDistance,
  })

  useEffect(() => {
    return bindTouchEvents(containerRef.current)
  }, [bindTouchEvents])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden",
        "touch-manipulation select-none",
        className
      )}
    >
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: pullDistance }}
        animate={controls}
      >
        <motion.div
          className="flex flex-col items-center"
          animate={{
            rotate: isRefreshing ? 360 : 0,
            scale: pullProgress > 0 ? 1 : 0,
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: isRefreshing ? Infinity : 0,
              ease: "linear",
            },
          }}
        >
          <RefreshCw className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">
            {isRefreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
} 
