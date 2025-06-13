"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Bell, X, Check, AlertCircle } from "lucide-react"

interface GamingNotification {
  id: string
  type: "upgrade" | "tag" | "session"
  title: string
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
}

interface MobileGamingNotificationProps {
  notification: GamingNotification
  onDismiss: (id: string) => void
  className?: string
}

export function MobileGamingNotification({
  notification,
  onDismiss,
  className,
}: MobileGamingNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(notification.id), 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, onDismiss])

  const getIcon = () => {
    switch (notification.type) {
      case "upgrade":
        return <Check className="w-5 h-5 text-green-500" />
      case "tag":
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case "session":
        return <Bell className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "upgrade":
        return "bg-green-500/10"
      case "tag":
        return "bg-blue-500/10"
      case "session":
        return "bg-purple-500/10"
      default:
        return "bg-gray-500/10"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50",
            "rounded-lg shadow-lg overflow-hidden",
            getBackgroundColor(),
            className
          )}
        >
          <div
            className="p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{notification.title}</p>
                <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                {isExpanded && notification.action && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 w-full py-2 px-4 bg-white/10 rounded-md text-sm font-medium text-white hover:bg-white/20 active:bg-white/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      notification.action?.onClick()
                    }}
                  >
                    {notification.action.label}
                  </motion.button>
                )}
              </div>
              <button
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsVisible(false)
                  setTimeout(() => onDismiss(notification.id), 300)
                }}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
