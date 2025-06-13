"use client"

import { useRef, useEffect, ReactNode, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import styles from "./mobile-list.module.css"

interface MobileListItem {
  id: string
  content: React.ReactNode
  actions?: {
    left?: {
      icon: React.ReactNode
      label: string
      onClick: () => void
      color?: string
    }
    right?: {
      icon: React.ReactNode
      label: string
      onClick: () => void
      color?: string
    }
  }
}

interface MobileListProps {
  items: MobileListItem[]
  className?: string
  onItemTap?: (itemId: string) => void
  onItemDoubleTap?: (itemId: string) => void
  swipeThreshold?: number
  swipeDistance?: number
}

export function MobileList({
  items,
  className,
  onItemTap,
  onItemDoubleTap,
  swipeThreshold = 50,
  swipeDistance = 100,
}: MobileListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set())

  const handleSwipe = (itemId: string, direction: 'left' | 'right') => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    setAnimatingItems(prev => new Set([...prev, itemId]))

    if (direction === 'left' && item.actions?.left) {
      setTimeout(() => {
        item.actions!.left!.onClick()
        setAnimatingItems(prev => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 300)
    } else if (direction === 'right' && item.actions?.right) {
      setTimeout(() => {
        item.actions!.right!.onClick()
        setAnimatingItems(prev => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 300)
    }
  }

  const handleTap = (itemId: string) => {
    onItemTap?.(itemId)
  }

  const handleDoubleTap = (itemId: string) => {
    onItemDoubleTap?.(itemId)
  }

  return (
    <div
      ref={listRef}
      className={cn(
        "w-full space-y-2",
        "touch-manipulation select-none",
        className
      )}
    >
      {items.map((item) => {
        const isAnimating = animatingItems.has(item.id)

        return (
          <motion.div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el)
            }}
            className={cn(
              "relative w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden",
              "active:bg-gray-700"
            )}
            animate={isAnimating ? { x: 0, opacity: 0 } : { x: 0, opacity: 1 }}
            initial={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative">
              {/* Left Action */}
              {item.actions?.left && (
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-20",
                    "flex items-center justify-center",
                    "bg-gray-700"
                  )}
                  style={{ backgroundColor: item.actions.left.color }}
                >
                  <div className="flex flex-col items-center text-white">
                    {item.actions.left.icon}
                    <span className="text-xs mt-1">{item.actions.left.label}</span>
                  </div>
                </div>
              )}

              {/* Right Action */}
              {item.actions?.right && (
                <div
                  className={cn(
                    "absolute right-0 top-0 bottom-0 w-20",
                    "flex items-center justify-center",
                    "bg-gray-700"
                  )}
                  style={{ backgroundColor: item.actions.right.color }}
                >
                  <div className="flex flex-col items-center text-white">
                    {item.actions.right.icon}
                    <span className="text-xs mt-1">{item.actions.right.label}</span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {item.content}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

interface MobileListItemProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  onClick?: () => void
}

export function MobileListItem({
  title,
  description,
  icon,
  action,
  onClick,
}: MobileListItemProps) {
  return (
    <div className={styles.listItem} onClick={onClick}>
      {icon && <div className={styles.listItemIcon}>{icon}</div>}
      <div className={styles.listItemContent}>
        <div className={styles.listItemTitle}>{title}</div>
        {description && (
          <div className={styles.listItemDescription}>{description}</div>
        )}
      </div>
      {action && <div className={styles.listItemAction}>{action}</div>}
    </div>
  )
} 
