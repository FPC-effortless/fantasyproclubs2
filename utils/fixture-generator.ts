import { CompetitionSettings, Match, Group, CompetitionType } from '@/types/competition'
import { v4 as uuidv4 } from 'uuid'

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function generateMatchDates(startDate: Date, frequency: string, numberOfMatchdays: number): Date[] {
  const dates: Date[] = []
  let currentDate = new Date(startDate)

  for (let i = 0; i < numberOfMatchdays; i++) {
    dates.push(new Date(currentDate))
    
    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }
  }

  return dates
}

function generateMatchTimes(numberOfMatches: number): string[] {
  const times: string[] = []
  const startHour = 15 // 3 PM
  const interval = 30 // 30 minutes between matches

  for (let i = 0; i < numberOfMatches; i++) {
    const minutes = (i * interval) % 60
    const hours = startHour + Math.floor((i * interval) / 60)
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
    times.push(timeString)
  }

  return times
}

export function generateLeagueFixtures(
  teams: string[],
  settings: CompetitionSettings
): Match[] {
  const fixtures: Match[] = []
  const numberOfRounds = settings.homeAndAway ? 2 : 1
  const numberOfMatchdays = Math.ceil((teams.length - 1) * numberOfRounds)
  const matchDates = generateMatchDates(
    new Date(settings.startDate),
    settings.frequency,
    numberOfMatchdays
  )

  // Generate fixtures for each matchday
  for (let matchday = 0; matchday < numberOfMatchdays; matchday++) {
    const matchDate = matchDates[matchday]
    const availableTeams = [...teams]
    const matchesThisDay: { home: string; away: string }[] = []

    // Generate all possible matches for this matchday
    while (availableTeams.length >= 2) {
      const homeTeam = availableTeams.shift()!
      const awayTeam = availableTeams.shift()!
      matchesThisDay.push({ home: homeTeam, away: awayTeam })
    }

    // If there's an odd number of teams, the last team gets a bye
    if (availableTeams.length === 1) {
      console.log(`Team ${availableTeams[0]} gets a bye on matchday ${matchday + 1}`)
    }

    // Generate match times for this matchday
    const matchTimes = generateMatchTimes(matchesThisDay.length)

    // Create fixtures with specific times
    matchesThisDay.forEach((match, index) => {
      const matchTime = matchTimes[index]
      const matchDateTime = new Date(matchDate)
      const [hours, minutes] = matchTime.split(':').map(Number)
      matchDateTime.setHours(hours, minutes, 0, 0)

      fixtures.push({
        id: uuidv4(),
        competition_id: settings.id,
        home_team_id: match.home,
        away_team_id: match.away,
        match_date: matchDateTime.toISOString(),
        status: 'scheduled',
        matchday: matchday + 1,
        home_team_stats: {},
        away_team_stats: {}
      })
    })
  }

  return fixtures
}

export function generateGroupFixtures(
  groups: Group[],
  settings: CompetitionSettings
): Match[] {
  const fixtures: Match[] = []
  let dateIndex = 0

  for (const group of groups) {
    const groupFixtures = generateLeagueFixtures(group.teams, {
      ...settings,
      id: settings.id
    })

    // Add group information to each fixture
    groupFixtures.forEach(fixture => {
      fixtures.push({
        ...fixture,
        id: uuidv4(),
        group: group.id,
        home_team_stats: {},
        away_team_stats: {}
      })
    })
  }

  return fixtures
}

export function generateKnockoutFixtures(
  teams: string[],
  settings: CompetitionSettings
): Match[] {
  const fixtures: Match[] = []
  const shuffledTeams = shuffleArray(teams)
  const numberOfRounds = Math.ceil(Math.log2(teams.length))
  let matchDates = generateMatchDates(
    new Date(settings.startDate),
    settings.frequency,
    numberOfRounds
  )

  // First round matches
  let currentRoundTeams = [...shuffledTeams]
  if (currentRoundTeams.length % 2 !== 0) {
    // Instead of adding a bye, we'll give the last team a first-round bye
    const byeTeam = currentRoundTeams.pop()!
    currentRoundTeams.push('bye')
    currentRoundTeams.push(byeTeam)
  }

  for (let round = 0; round < numberOfRounds; round++) {
    const matchesThisRound = Math.ceil(currentRoundTeams.length / 2)
    const matchTimes = generateMatchTimes(matchesThisRound)

    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      if (currentRoundTeams[i] === 'bye' || currentRoundTeams[i + 1] === 'bye') continue

      const matchTime = matchTimes[Math.floor(i / 2)]
      const matchDateTime = new Date(matchDates[round])
      const [hours, minutes] = matchTime.split(':').map(Number)
      matchDateTime.setHours(hours, minutes, 0, 0)

      fixtures.push({
        id: uuidv4(),
        competition_id: settings.id,
        home_team_id: currentRoundTeams[i],
        away_team_id: currentRoundTeams[i + 1],
        match_date: matchDateTime.toISOString(),
        status: 'scheduled',
        round: round + 1,
        matchday: round + 1,
        home_team_stats: {},
        away_team_stats: {}
      })
    }

    // Prepare for next round (placeholder teams)
    currentRoundTeams = Array(Math.ceil(currentRoundTeams.length / 2)).fill('tbd')
  }

  // Add third place playoff if enabled
  if (settings.thirdPlacePlayoff) {
    const matchTime = generateMatchTimes(1)[0]
    const matchDateTime = new Date(matchDates[matchDates.length - 1])
    const [hours, minutes] = matchTime.split(':').map(Number)
    matchDateTime.setHours(hours, minutes, 0, 0)

    fixtures.push({
      id: uuidv4(),
      competition_id: settings.id,
      home_team_id: 'tbd',
      away_team_id: 'tbd',
      match_date: matchDateTime.toISOString(),
      status: 'scheduled',
      round: numberOfRounds + 1,
      matchday: numberOfRounds + 1,
      home_team_stats: {},
      away_team_stats: {}
    })
  }

  return fixtures
}

export function generateFixtures(
  teams: string[],
  settings: CompetitionSettings
): { fixtures: Match[], groups?: Group[] } {
  if (!teams || teams.length < 2) {
    throw new Error('At least 2 teams are required to generate fixtures')
  }

  let fixtures: Match[] = []
  let groups: Group[] | undefined

  switch (settings.type) {
    case 'league':
      fixtures = generateLeagueFixtures(teams, settings)
      break
    case 'cup':
      if (settings.groupStage) {
        if (!settings.numberOfGroups || settings.numberOfGroups < 2) {
          throw new Error('Group stage requires at least 2 groups')
        }
        if (teams.length < settings.numberOfGroups * 2) {
          throw new Error(`Not enough teams for ${settings.numberOfGroups} groups. Need at least ${settings.numberOfGroups * 2} teams.`)
        }
        groups = createGroups(teams, settings.numberOfGroups)
        fixtures = generateGroupFixtures(groups, settings)
      } else {
        if (teams.length < 4) {
          throw new Error('Knockout tournament requires at least 4 teams')
        }
        fixtures = generateKnockoutFixtures(teams, settings)
      }
      break
    default:
      throw new Error(`Unsupported competition type: ${settings.type}`)
  }

  return { fixtures, groups }
}

function createGroups(teams: string[], numberOfGroups: number): Group[] {
  const shuffledTeams = shuffleArray(teams)
  const teamsPerGroup = Math.ceil(teams.length / numberOfGroups)
  const groups: Group[] = []

  for (let i = 0; i < numberOfGroups; i++) {
    const groupTeams = shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup)
    groups.push({
      id: uuidv4(),
      name: `Group ${String.fromCharCode(65 + i)}`,
      teams: groupTeams
    })
  }

  return groups
} 
