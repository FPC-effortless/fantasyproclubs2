"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"

interface MobileImageViewerProps {
  src: string
  alt?: string
  className?: string
  maxZoom?: number
  minZoom?: number
  doubleTapZoom?: number
}

export function MobileImageViewer({
  src,
  alt,
  className,
  maxZoom = 3,
  minZoom = 1,
  doubleTapZoom = 2,
}: MobileImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const handlePinch = (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, minZoom), maxZoom)
    setScale(clampedScale)
    setIsZoomed(clampedScale > 1)
  }

  const handleDoubleTap = () => {
    const newScale = isZoomed ? 1 : doubleTapZoom
    setScale(newScale)
    setIsZoomed(!isZoomed)
    if (!isZoomed) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const { bindTouchEvents } = useTouchGestures({
    onPinch: handlePinch,
    onDoubleTap: handleDoubleTap,
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
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <Image
          src={src}
          alt={alt || ''}
          width={400}
          height={400}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className={cn(
            "p-2 rounded-full bg-black/50",
            "hover:bg-black/70 active:bg-black/90",
            "transition-colors"
          )}
          onClick={() => {
            const newScale = Math.max(scale - 0.5, minZoom)
            setScale(newScale)
            setIsZoomed(newScale > 1)
          }}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          className={cn(
            "p-2 rounded-full bg-black/50",
            "hover:bg-black/70 active:bg-black/90",
            "transition-colors"
          )}
          onClick={() => {
            const newScale = Math.min(scale + 0.5, maxZoom)
            setScale(newScale)
            setIsZoomed(newScale > 1)
          }}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Zoom Indicator */}
      {isZoomed && (
        <div className="absolute top-4 left-4 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )
} 
