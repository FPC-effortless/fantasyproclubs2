"use client"

import { useEffect } from 'react'

export function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox

      // Add event listeners to handle PWA lifecycle
      const promptNewVersionAvailable = () => {
        // This will be handled by the UpdateNotification component
        console.log('New version available')
      }

      const promptNewContentAvailable = () => {
        // This will be handled by the UpdateNotification component
        console.log('New content available')
      }

      // Register service worker
      wb.register()

      // Add event listeners
      wb.addEventListener('installed', (event: any) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('controlling', (event: any) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('activated', (event: any) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      // Send skipWaiting message
      wb.addEventListener('waiting', () => {
        wb.messageSkipWaiting()
      })

      // Handle updates
      wb.addEventListener('installed', (event: any) => {
        if (event.isUpdate) {
          promptNewVersionAvailable()
        }
      })

      wb.addEventListener('controlling', () => {
        promptNewContentAvailable()
      })

      // Cleanup
      return () => {
        wb.removeEventListener('installed', promptNewVersionAvailable)
        wb.removeEventListener('controlling', promptNewContentAvailable)
      }
    }
  }, [])

  return null
}

// Add TypeScript declarations for workbox
declare global {
  interface Window {
    workbox: {
      register: () => void
      addEventListener: (event: string, callback: (event: any) => void) => void
      removeEventListener: (event: string, callback: (event: any) => void) => void
      messageSkipWaiting: () => void
    }
  }
} 
