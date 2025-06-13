import { Player } from '@/types/database'

// Point values for different actions
const POINTS = {
  GOAL: 4,
  ASSIST: 3,
  CLEAN_SHEET: {
    GK: 4,
    DEF: 4,
    MID: 1,
    FWD: 0,
  },
  YELLOW_CARD: -1,
  RED_CARD: -3,
  SAVE: 1,
  PENALTY_SAVE: 5,
  PENALTY_MISS: -2,
  OWN_GOAL: -2,
  BONUS: {
    TOP_PERFORMER: 3,
    SECOND_PERFORMER: 2,
    THIRD_PERFORMER: 1,
  },
}

export const calculatePlayerPoints = (player: Player): number => {
  let points = 0

  // Goals
  points += player.goals * POINTS.GOAL

  // Assists
  points += player.assists * POINTS.ASSIST

  // Clean sheets
  if (player.position === 'GK' || player.position === 'DEF') {
    points += player.clean_sheets * POINTS.CLEAN_SHEET.DEF
  } else if (player.position === 'MID') {
    points += player.clean_sheets * POINTS.CLEAN_SHEET.MID
  }

  // Cards
  points += player.yellow_cards * POINTS.YELLOW_CARD
  points += player.red_cards * POINTS.RED_CARD

  return points
}

export const calculateTeamPoints = (players: Player[]): number => {
  return players.reduce((total, player) => total + calculatePlayerPoints(player), 0)
}

export const calculateBonusPoints = (players: Player[]): Player[] => {
  // Sort players by points
  const sortedPlayers = [...players].sort((a, b) => calculatePlayerPoints(b) - calculatePlayerPoints(a))

  // Assign bonus points
  return sortedPlayers.map((player, index) => {
    if (index === 0) {
      return { ...player, points: player.points + POINTS.BONUS.TOP_PERFORMER }
    } else if (index === 1) {
      return { ...player, points: player.points + POINTS.BONUS.SECOND_PERFORMER }
    } else if (index === 2) {
      return { ...player, points: player.points + POINTS.BONUS.THIRD_PERFORMER }
    }
    return player
  })
}

export const calculateMatchPoints = (
  homePlayers: Player[],
  awayPlayers: Player[]
): { homePoints: number; awayPoints: number } => {
  const homePoints = calculateTeamPoints(homePlayers)
  const awayPoints = calculateTeamPoints(awayPlayers)

  return { homePoints, awayPoints }
}

export const calculateLeaguePoints = (
  homeGoals: number,
  awayGoals: number
): { homePoints: number; awayPoints: number } => {
  if (homeGoals > awayGoals) {
    return { homePoints: 3, awayPoints: 0 }
  } else if (homeGoals < awayGoals) {
    return { homePoints: 0, awayPoints: 3 }
  } else {
    return { homePoints: 1, awayPoints: 1 }
  }
}

export const calculateGoalDifference = (goalsFor: number, goalsAgainst: number): number => {
  return goalsFor - goalsAgainst
}

export const calculateWinPercentage = (wins: number, total: number): number => {
  if (total === 0) return 0
  return (wins / total) * 100
}

export const calculateAveragePoints = (points: number, matches: number): number => {
  if (matches === 0) return 0
  return points / matches
}

export const calculateFormPoints = (results: ('W' | 'D' | 'L')[]): number => {
  return results.reduce((total, result) => {
    switch (result) {
      case 'W':
        return total + 3
      case 'D':
        return total + 1
      case 'L':
        return total
    }
  }, 0)
}

export const calculateFormString = (results: ('W' | 'D' | 'L')[]): string => {
  return results.join('')
}

export const calculatePosition = (
  points: number,
  goalDifference: number,
  goalsFor: number
): number => {
  // This is a simplified version. In reality, you would need to compare with other teams
  return points * 1000000 + goalDifference * 1000 + goalsFor
}

export const calculateRanking = (
  teams: { points: number; goalDifference: number; goalsFor: number }[]
): number[] => {
  const positions = teams.map((team) =>
    calculatePosition(team.points, team.goalDifference, team.goalsFor)
  )
  const sortedPositions = [...positions].sort((a, b) => b - a)
  return positions.map((position) => sortedPositions.indexOf(position) + 1)
} 
