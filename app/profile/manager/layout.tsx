"use client"

import { ReactNode } from "react"

interface ManagerLayoutProps {
  children: ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
} 
