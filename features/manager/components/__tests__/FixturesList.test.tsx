import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FixturesList } from '../FixturesList'
import { Fixture } from '@/types/match'

const mockFixtures: Fixture[] = [
  {
    id: '1',
    date: '2024-01-15',
    opponent: 'Arsenal FC',
    homeTeam: 'Manchester United',
    awayTeam: 'Arsenal FC',
    time: '15:00',
    competition: 'Premier League',
    venue: 'Emirates Stadium',
    isHome: true,
    status: 'upcoming' as const,
  },
  {
    id: '2',
    date: '2024-01-22',
    opponent: 'Liverpool FC',
    competition: 'Premier League',
    venue: 'Old Trafford',
    isHome: false,
    status: 'upcoming' as const,
    homeTeam: 'Liverpool FC',
    awayTeam: 'Manchester United',
    time: '16:30',
  },
]

describe('FixturesList', () => {
  it('renders fixtures correctly', () => {
    const { getByText } = render(<FixturesList fixtures={mockFixtures} />)
    
    expect(getByText('Team B')).toBeInTheDocument()
    expect(getByText('Team C')).toBeInTheDocument()
    expect(getByText('Stadium A')).toBeInTheDocument()
    expect(getByText('Stadium C')).toBeInTheDocument()
  })

  it('calls onFixtureClick when clicking a fixture', async () => {
    const handleFixtureClick = jest.fn()
    const { getByText } = render(
      <FixturesList fixtures={mockFixtures} onFixtureClick={handleFixtureClick} />
    )
    
    await userEvent.click(getByText('vs Team B'))
    expect(handleFixtureClick).toHaveBeenCalledWith(mockFixtures[0])
  })

  it('displays correct date format', () => {
    const { getByText } = render(<FixturesList fixtures={mockFixtures} />)
    
    // Check if dates are formatted correctly
    expect(getByText(/Mar 15, 2024/)).toBeInTheDocument()
    expect(getByText(/Mar 22, 2024/)).toBeInTheDocument()
  })

  it('shows correct competition name', () => {
    const { getAllByText } = render(<FixturesList fixtures={mockFixtures} />)
    
    const competitionElements = getAllByText('Premier League')
    expect(competitionElements).toHaveLength(2)
  })
}) 