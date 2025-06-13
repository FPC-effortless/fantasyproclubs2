"use client"

import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { Gamepad2 } from "lucide-react"
import styles from "./mobile-platform-selector.module.css"

interface MobilePlatformSelectorProps {
  value: "xbox" | "playstation" | "both"
  onChange: (value: "xbox" | "playstation" | "both") => void
  className?: string
}

export function MobilePlatformSelector({
  value,
  onChange,
  className,
}: MobilePlatformSelectorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  const platforms = [
    { id: "xbox", label: "Xbox", color: "#107C10" },
    { id: "playstation", label: "PlayStation", color: "#003791" },
    { id: "both", label: "Both", color: "#6B46C1" },
  ]

  const currentIndex = platforms.findIndex((p) => p.id === value)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const containerWidth = containerRef.current?.offsetWidth || 0
    const threshold = containerWidth * 0.2

    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1
      const newIndex = Math.max(0, Math.min(platforms.length - 1, currentIndex + direction))
      onChange(platforms[newIndex].id as "xbox" | "playstation" | "both")
    }

    controls.start({ x: 0 })
  }

  const handleTap = (platformId: "xbox" | "playstation" | "both") => {
    onChange(platformId)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden touch-manipulation",
        className
      )}
    >
      <motion.div
        className="flex w-full"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            className={cn(
              styles.platformItem,
              isDragging && styles.dragging
            )}
            onClick={() => !isDragging && handleTap(platform.id as "xbox" | "playstation" | "both")}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  styles.platformIcon,
                  value === platform.id ? styles[platform.id] : styles.inactive
                )}
              >
                <Gamepad2
                  className={cn(
                    "w-6 h-6",
                    value === platform.id ? "text-white" : "text-gray-400"
                  )}
                />
              </div>
              <span
                className={cn(
                  styles.platformLabel,
                  value === platform.id ? styles.active : styles.inactive
                )}
              >
                {platform.label}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination Indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {platforms.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-200",
              index === currentIndex ? "bg-white" : "bg-gray-600"
            )}
          />
        ))}
      </div>
    </div>
  )
} 
