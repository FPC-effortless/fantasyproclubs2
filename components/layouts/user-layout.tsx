"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Trophy, Star, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserLayoutProps {
  children: React.ReactNode
  userType: "manager" | "player" | "fan"
}

const getTabs = (userType: "manager" | "player" | "fan") => [
  { name: 'Home', icon: Home, route: `/${userType}/home` },
  { name: 'Competitions', icon: Trophy, route: `/${userType}/competitions` },
  { name: 'Fantasy', icon: Star, route: `/${userType}/fantasy` },
  { name: 'Profile', icon: User, route: `/${userType}/profile` }
]

export function UserLayout({ children, userType }: UserLayoutProps) {
  const pathname = usePathname()
  const tabs = getTabs(userType)

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Main Content */}
      <main className="container mx-auto px-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-around">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.route)
              return (
                <Link
                  key={tab.name}
                  href={tab.route}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs">{tab.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
} 
