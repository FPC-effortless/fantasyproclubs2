import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LayoutWrapper } from '../layout-wrapper'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('LayoutWrapper', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('shows bottom navigation on regular pages', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('hides bottom navigation on login page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/auth/login')
    render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('hides bottom navigation on signup page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/auth/signup')
    render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('applies correct layout classes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    const { container } = render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    const main = container.querySelector('main')
    expect(main).toHaveClass('pb-16')
    expect(main).toHaveClass('min-h-screen')
    expect(main).toHaveClass('bg-background')
    expect(main).toHaveClass('text-foreground')
  })

  it('renders multiple children correctly', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    render(
      <LayoutWrapper>
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </LayoutWrapper>
    )
    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
    expect(screen.getByText('Third child')).toBeInTheDocument()
  })

  it('updates navigation visibility when pathname changes', () => {
    const { rerender } = render(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )

    // Initial render with regular page
    ;(usePathname as jest.Mock).mockReturnValue('/')
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    // Re-render with login page
    ;(usePathname as jest.Mock).mockReturnValue('/auth/login')
    rerender(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()

    // Re-render back to regular page
    ;(usePathname as jest.Mock).mockReturnValue('/')
    rerender(
      <LayoutWrapper>
        <div>Test content</div>
      </LayoutWrapper>
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
}) 
