import { usePathname } from 'next/navigation'
import { BreadcrumbItem } from '@/components/ui/breadcrumbs'

const routeLabels: Record<string, string> = {
  auth: 'Authentication',
  login: 'Login',
  signup: 'Sign Up',
  'reset-password': 'Reset Password',
  manager: 'Manager',
  team: 'Team',
  profile: 'Profile',
  settings: 'Settings',
  competitions: 'Competitions',
  fantasy: 'Fantasy Teams',
  gaming: 'Gaming Settings',
  upgrade: 'Account Upgrade',
  admin: 'Admin',
  upgrades: 'Upgrade Requests',
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return segments.reduce<BreadcrumbItem[]>((items, segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const label = routeLabels[segment] || segment

    items.push({
      label,
      href,
      current: index === segments.length - 1,
    })

    return items
  }, [])
} 
