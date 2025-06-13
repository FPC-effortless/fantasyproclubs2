import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { TeamMembersList } from '../TeamMembersList'
import { TeamMember } from '@/types/team'

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Forward',
    jerseyNumber: 10,
    role: 'player',
    matchesPlayed: 15,
    goals: 12,
    assists: 8,
    rating: 8.5,
    status: 'active',
    stats: {
      matches: 15,
      goals: 12,
      assists: 8,
      rating: 8.5,
    },
    gaming: {
      xbox_gamertag: "",
      psn_id: "",
      preferred_platform: "xbox",
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Midfielder',
    jerseyNumber: 8,
    role: 'captain',
    matchesPlayed: 18,
    goals: 5,
    assists: 15,
    rating: 8.8,
    status: 'active',
    stats: {
      matches: 18,
      goals: 5,
      assists: 15,
      rating: 8.8,
    },
    gaming: {
      xbox_gamertag: "",
      psn_id: "",
      preferred_platform: "xbox",
    },
  },
]

describe('TeamMembersList', () => {
  const mockOnMemberClick = jest.fn()

  beforeEach(() => {
    mockOnMemberClick.mockClear()
  })

  it('renders team members list', () => {
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Forward')).toBeInTheDocument()
    expect(screen.getByText('Midfielder')).toBeInTheDocument()
  })

  it('displays member statistics', () => {
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    expect(screen.getAllByText('12')).toHaveLength(1)
    expect(screen.getAllByText('15')).toHaveLength(1)
  })

  it('calls onMemberClick when a member is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    await user.click(screen.getByText('John Doe'))
    expect(mockOnMemberClick).toHaveBeenCalledWith(mockTeamMembers[0])
  })

  it('sorts members by rating by default', () => {
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    const memberElements = screen.getAllByRole('row')
    expect(memberElements[1]).toHaveTextContent('Jane Smith') // Higher rating (8.8)
    expect(memberElements[2]).toHaveTextContent('John Doe') // Lower rating (8.5)
  })

  it('sorts members by goals when goals header is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    await user.click(screen.getByText('Goals'))
    const memberElements = screen.getAllByRole('row')
    expect(memberElements[1]).toHaveTextContent('John Doe') // More goals (12)
    expect(memberElements[2]).toHaveTextContent('Jane Smith') // Fewer goals (5)
  })

  it('sorts members by assists when assists header is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamMembersList members={mockTeamMembers} onMemberClick={mockOnMemberClick} />)
    
    await user.click(screen.getByText('Assists'))
    const memberElements = screen.getAllByRole('row')
    expect(memberElements[1]).toHaveTextContent('Jane Smith') // More assists (15)
    expect(memberElements[2]).toHaveTextContent('John Doe') // Fewer assists (8)
  })

  it('displays empty state when no members are provided', () => {
    render(<TeamMembersList members={[]} onMemberClick={mockOnMemberClick} />)
    
    expect(screen.getByText((content, node) => !!node && !!node.textContent && node.textContent.includes('No team members found'))).toBeInTheDocument()
  })
}) 