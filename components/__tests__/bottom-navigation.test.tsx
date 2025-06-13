import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BottomNavigation } from '../bottom-navigation'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('BottomNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all navigation items', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(<BottomNavigation />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Competitions')).toBeInTheDocument()
    expect(screen.getByText('Fantasy')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('applies active styles to current page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    render(<BottomNavigation />)
    
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveClass('text-accent')
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies active styles to nested routes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/competitions/123')
    render(<BottomNavigation />)
    
    const competitionsLink = screen.getByText('Competitions').closest('a')
    expect(competitionsLink).toHaveClass('text-accent')
    expect(competitionsLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies hover styles to inactive items', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    render(<BottomNavigation />)
    
    const fantasyLink = screen.getByText('Fantasy').closest('a')
    expect(fantasyLink).toHaveClass('text-muted-foreground')
    expect(fantasyLink).toHaveClass('hover:text-foreground')
  })

  it('renders with correct accessibility attributes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(<BottomNavigation />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Bottom navigation')
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('tabIndex', '0')
    })
  })

  it('applies correct layout classes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    const { container } = render(<BottomNavigation />)
    
    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('fixed')
    expect(nav).toHaveClass('bottom-0')
    expect(nav).toHaveClass('left-0')
    expect(nav).toHaveClass('right-0')
    expect(nav).toHaveClass('z-50')
    expect(nav).toHaveClass('bg-background')
    expect(nav).toHaveClass('border-t')
    expect(nav).toHaveClass('border-border')
    
    const grid = container.querySelector('div.grid')
    expect(grid).toHaveClass('grid-cols-4')
    expect(grid).toHaveClass('h-16')
  })

  it('shows active indicator for current page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/fantasy')
    render(<BottomNavigation />)
    
    const fantasyLink = screen.getByText('Fantasy').closest('a')
    const activeIndicator = fantasyLink?.querySelector('.bg-accent')
    expect(activeIndicator).toBeInTheDocument()
  })

  it('updates active state when pathname changes', () => {
    const { rerender } = render(<BottomNavigation />)
    
    // Initial render with home active
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    expect(screen.getByText('Home').closest('a')).toHaveClass('text-accent')
    
    // Re-render with fantasy active
    ;(usePathname as jest.Mock).mockReturnValue('/fantasy')
    rerender(<BottomNavigation />)
    expect(screen.getByText('Fantasy').closest('a')).toHaveClass('text-accent')
    expect(screen.getByText('Home').closest('a')).not.toHaveClass('text-accent')
  })

  it('handles root path correctly', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(<BottomNavigation />)
    
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).not.toHaveClass('text-accent')
  })
}) 
