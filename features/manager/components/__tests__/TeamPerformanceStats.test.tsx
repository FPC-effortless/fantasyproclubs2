import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TeamPerformanceStats } from '../TeamPerformanceStats'
import { TeamPerformance } from '@/types/team'
import { mockResponsiveContainer } from '@/test-utils/mocks'
import '@/test-utils/mocks.css'

// Mock the ResponsiveContainer component from recharts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: mockResponsiveContainer,
  }
})

const mockTeamPerformance: TeamPerformance = {
  wins: 15,
  draws: 5,
  losses: 3,
  goalsFor: 45,
  goalsAgainst: 20,
  cleanSheets: 8,
  form: ['W', 'W', 'D', 'L', 'W'],
  recentMatches: [
    { date: '2024-03-01', opponent: 'Team B', result: '3-1', venue: 'home' },
    { date: '2024-02-24', opponent: 'Team C', result: '2-0', venue: 'away' },
  ],
  performanceOverTime: [
    { date: '2024-01', wins: 3, draws: 1, losses: 1 },
    { date: '2024-02', wins: 4, draws: 0, losses: 1 },
    { date: '2024-03', wins: 2, draws: 1, losses: 0 },
  ],
}

describe('TeamPerformanceStats', () => {
  it('renders performance stats correctly', () => {
    render(<TeamPerformanceStats performance={mockTeamPerformance} />)
    
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('Goals Scored')).toBeInTheDocument()
    expect(screen.getByText('Clean Sheets')).toBeInTheDocument()
    expect(screen.getByText('Recent Form')).toBeInTheDocument()
    expect(screen.getByText('Performance Over Time')).toBeInTheDocument()
  })

  it('shows correct win rate', () => {
    render(<TeamPerformanceStats performance={mockTeamPerformance} />)
    
    expect(screen.getByText('65.2%')).toBeInTheDocument()
  })

  it('shows correct goals scored', () => {
    render(<TeamPerformanceStats performance={mockTeamPerformance} />)
    
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText((content, node) => !!node && !!node.textContent && node.textContent.includes('per match'))).toBeInTheDocument()
  })

  it('shows correct clean sheets', () => {
    render(<TeamPerformanceStats performance={mockTeamPerformance} />)
    
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('34.8% of matches')).toBeInTheDocument()
  })

  it('shows recent form', () => {
    render(<TeamPerformanceStats performance={mockTeamPerformance} />)
    
    const wins = screen.getAllByText('W')
    expect(wins).toHaveLength(3) // 3 wins in the form
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })
}) 