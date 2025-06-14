"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { GlobalSignInPrompt } from "@/components/global-signin-prompt"
import { OnboardingWizard } from "@/components/onboarding-wizard"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const hideBottomNav = pathname === "/login" || pathname === "/auth/signup"
  const hideSignInPrompt = pathname === "/login" || pathname === "/auth/signup"

  return (
    <>
      <main className="pb-16 min-h-screen bg-background text-foreground">{children}</main>
      {!hideBottomNav && <BottomNavigation />}
      {!hideSignInPrompt && <GlobalSignInPrompt />}
      <OnboardingWizard />
    </>
  )
}
