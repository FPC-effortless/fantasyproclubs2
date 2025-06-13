"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    setShowUpdate(false)
    window.location.reload()
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              New Update Available
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              A new version of Fantasy Pro Clubs is available. Update now to get the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                className="bg-[#00ff87] text-gray-900 hover:bg-[#00cc6a]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
