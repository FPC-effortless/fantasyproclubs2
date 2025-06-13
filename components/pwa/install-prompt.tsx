"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI to notify the user they can add to home screen
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null)

    // Hide the prompt
    setShowPrompt(false)

    // Optionally, send analytics event with outcome
    console.log(`User response to the install prompt: ${outcome}`)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Install Fantasy Pro Clubs
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Install our app for a better experience. Get quick access to competitions and fantasy teams.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="bg-[#00ff87] text-gray-900 hover:bg-[#00cc6a]"
              >
                Install
              </Button>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white"
            aria-label="Close install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 
