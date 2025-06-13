"use client"

import { ReactNode } from 'react'
import { PWARegistration } from './pwa-registration'
import { InstallPrompt } from './install-prompt'
import { UpdateNotification } from './update-notification'

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  return (
    <>
      <PWARegistration />
      <InstallPrompt />
      <UpdateNotification />
      {children}
    </>
  )
} 
