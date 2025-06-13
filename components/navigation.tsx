'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Team', href: '/teams', icon: Users },
  { name: 'Competitions', href: '/competitions', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const activeItemRef = useRef<HTMLAnchorElement>(null)

  // Focus the active item when the component mounts or pathname changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.focus()
    }
  }, [pathname])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const items = navRef.current?.querySelectorAll('a')
    if (!items) return

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = (index + 1) % items.length
        items[nextIndex].focus()
        break
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = (index - 1 + items.length) % items.length
        items[prevIndex].focus()
        break
      case 'Home':
        e.preventDefault()
        items[0].focus()
        break
      case 'End':
        e.preventDefault()
        items[items.length - 1].focus()
        break
    }
  }

  return (
    <nav 
      ref={navRef}
      className="border-b bg-background"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  ref={isActive ? activeItemRef : null}
                  className={cn(
                    'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
} 
