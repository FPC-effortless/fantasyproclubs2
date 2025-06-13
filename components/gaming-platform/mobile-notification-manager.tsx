"use client"

import { useState, useCallback } from "react"
import { MobileGamingNotification } from "./mobile-gaming-notification"

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

interface MobileNotificationManagerProps {
  className?: string
}

export function MobileNotificationManager({
  className,
}: MobileNotificationManagerProps) {
  const [notifications, setNotifications] = useState<GamingNotification[]>([])

  const addNotification = useCallback((notification: Omit<GamingNotification, "id" | "timestamp">) => {
    const newNotification: GamingNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    }

    setNotifications((prev) => [...prev, newNotification])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <div className={className}>
      {notifications.map((notification) => (
        <MobileGamingNotification
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  )
}

// Example usage:
/*
const notificationManager = {
  showUpgradeNotification: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: "upgrade",
      title,
      message,
      action,
    })
  },
  showTagNotification: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: "tag",
      title,
      message,
      action,
    })
  },
  showSessionNotification: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: "session",
      title,
      message,
      action,
    })
  },
}
*/ 
