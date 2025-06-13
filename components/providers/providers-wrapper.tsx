"use client"

import dynamic from "next/dynamic"
import { type ReactNode } from "react"

const SupabaseProvider = dynamic(() => import("./supabase-provider"), {
  ssr: false,
})

const AuthProvider = dynamic(
  () => import("@/lib/auth-context").then((mod) => mod.AuthProvider),
  { ssr: false }
)

const RootLayoutClient = dynamic(
  () => import("@/components/layouts/root-layout-client").then((mod) => mod.RootLayoutClient),
  { ssr: false }
)

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false }
)

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <Toaster />
      </AuthProvider>
    </SupabaseProvider>
  )
} 
