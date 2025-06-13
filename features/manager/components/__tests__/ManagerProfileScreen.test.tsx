import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ManagerProfileScreen } from '../ManagerProfileScreen'
import { Team, TeamMember, TeamPerformance } from '@/types/team'
import { Fixture } from '@/types/match'
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

const mockTeam: Team = {
  id: '1',
  name: 'Team A',
  shortName: 'TA',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  foundedDate: '2019-01-01',
  homeVenue: 'Stadium A',
  founded: '2019',
  stadium: 'Stadium A',
  logo: 'team-a-logo.png',
  manager: {
    id: '1',
    name: 'John Manager',
    email: 'john@example.com',
  },
  members: [],
  stats: {
    matches: 23,
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
    performance: {
      labels: ['Jan', 'Feb', 'Mar'],
      data: [5, 7, 11],
    },
    performanceOverTime: [
      { date: '2024-01', wins: 3, draws: 1, losses: 1 },
      { date: '2024-02', wins: 4, draws: 0, losses: 1 },
      { date: '2024-03', wins: 2, draws: 1, losses: 0 },
    ],
  },
  gaming: {
    preferred_platform: 'both',
    platform_requirements: {
      xbox_required: false,
      psn_required: false,
      min_experience: 'intermediate',
    },
    platform_stats: {
      xbox_players: 5,
      psn_players: 6,
      cross_platform_players: 2,
    },
  },
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'ST',
    jerseyNumber: 9,
    role: 'player',
    matchesPlayed: 20,
    goals: 15,
    assists: 5,
    rating: 85,
    status: 'active',
    stats: {
      matches: 20,
      goals: 15,
      assists: 5,
      rating: 8.5,
    },
    gaming: {
      xbox_gamertag: 'JohnDoe123',
      psn_id: undefined,
      preferred_platform: 'xbox',
      experience_level: 'intermediate',
      platform_verified: true,
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'CAM',
    jerseyNumber: 10,
    role: 'player',
    matchesPlayed: 18,
    goals: 8,
    assists: 12,
    rating: 82,
    status: 'active',
    stats: {
      matches: 18,
      goals: 8,
      assists: 12,
      rating: 8.2,
    },
    gaming: {
      xbox_gamertag: undefined,
      psn_id: 'JaneSmith456',
      preferred_platform: 'playstation',
      experience_level: 'advanced',
      platform_verified: true,
    },
  },
]

const mockTeamPerformance: TeamPerformance = {
  matches: 23,
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
  performance: {
    labels: ['Jan', 'Feb', 'Mar'],
    data: [5, 7, 11],
  },
  performanceOverTime: [
    { date: '2024-01', wins: 3, draws: 1, losses: 1 },
    { date: '2024-02', wins: 4, draws: 0, losses: 1 },
    { date: '2024-03', wins: 2, draws: 1, losses: 0 },
  ],
}

const mockFixtures: Fixture[] = [
  {
    id: '1',
    competition: 'League A',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    date: '2024-03-15',
    time: '15:00',
    venue: 'Stadium A',
    status: 'upcoming',
  },
  {
    id: '2',
    competition: 'League A',
    homeTeam: 'Team C',
    awayTeam: 'Team A',
    date: '2024-03-22',
    time: '15:00',
    venue: 'Stadium C',
    status: 'upcoming',
  },
]

describe('ManagerProfileScreen', () => {
  it('renders team information correctly', () => {
    render(
      <ManagerProfileScreen
        team={mockTeam}
        teamMembers={mockTeamMembers}
        teamPerformance={mockTeamPerformance}
        fixtures={mockFixtures}
        onEditProfile={() => {}}
        onMemberClick={() => {}}
        onFixtureClick={() => {}}
      />
    )
    
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText(/Founded/)).toBeInTheDocument()
  })

  it('calls onEditProfile when clicking edit button', async () => {
    const handleEditProfile = jest.fn()
    render(
      <ManagerProfileScreen
        team={mockTeam}
        teamMembers={mockTeamMembers}
        teamPerformance={mockTeamPerformance}
        fixtures={mockFixtures}
        onEditProfile={handleEditProfile}
        onMemberClick={() => {}}
        onFixtureClick={() => {}}
      />
    )
    
    await userEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    expect(handleEditProfile).toHaveBeenCalled()
  })

  it('displays team members correctly', async () => {
    render(
      <ManagerProfileScreen
        team={mockTeam}
        teamMembers={mockTeamMembers}
        teamPerformance={mockTeamPerformance}
        fixtures={mockFixtures}
        onEditProfile={() => {}}
        onMemberClick={() => {}}
        onFixtureClick={() => {}}
      />
    )
    
    // Click on the Team tab to show team members
    await userEvent.click(screen.getByRole('tab', { name: /team/i }))
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('ST')).toBeInTheDocument()
    expect(screen.getByText('CAM')).toBeInTheDocument()
  })

  it('displays team performance stats correctly', () => {
    render(
      <ManagerProfileScreen
        team={mockTeam}
        teamMembers={mockTeamMembers}
        teamPerformance={mockTeamPerformance}
        fixtures={mockFixtures}
        onEditProfile={() => {}}
        onMemberClick={() => {}}
        onFixtureClick={() => {}}
      />
    )
    
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('Goals Scored')).toBeInTheDocument()
    expect(screen.getByText('Clean Sheets')).toBeInTheDocument()
    expect(screen.getByText('Recent Form')).toBeInTheDocument()
  })

  it('displays upcoming fixtures correctly', async () => {
    render(
      <ManagerProfileScreen
        team={mockTeam}
        teamMembers={mockTeamMembers}
        teamPerformance={mockTeamPerformance}
        fixtures={mockFixtures}
        onEditProfile={() => {}}
        onMemberClick={() => {}}
        onFixtureClick={() => {}}
      />
    )
    
    // Click on the Fixtures tab to show fixtures
    await userEvent.click(screen.getByRole('tab', { name: /fixtures/i }))
    
    expect(screen.getByText((content, node) => !!node && !!node.textContent && node.textContent.includes('Team B'))).toBeInTheDocument()
    expect(screen.getByText((content, node) => !!node && !!node.textContent && node.textContent.includes('Team C'))).toBeInTheDocument()
    expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 22, 2024/)).toBeInTheDocument()
  })
}) 