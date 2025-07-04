
type PlayerMatchStats = Database['public']['Tables']['player_match_stats']['Row']

export const FANTASY_POINTS = {
  GOALS: {
    GK: 6,
    DEF: 6,
    MID: 5,
    FWD: 4
  },
  ASSISTS: {
    GK: 3,
    DEF: 3,
    MID: 3,
    FWD: 3
  },
  CLEAN_SHEET: {
    GK: 4,
    DEF: 4,
    MID: 1,
    FWD: 0
  },
  MINUTES_PLAYED: {
    OVER_60: 2,
    UNDER_60: 1
  },
  RATING: {
    OVER_8: 3,
    OVER_7: 1
  },
  CARDS: {
    YELLOW: -1,
    RED: -3
  },
  SAVES: {
    REGULAR: 0.5, // Per save
    PENALTY: 5
  },
  OTHER: {
    OWN_GOAL: -2,
    PENALTY_MISS: -2,
    MOTM: 3
  }
}

export const calculateFantasyPoints = (
  playerStats: any,
  position: string
): number => {
  let points = 0

  // Rating bonus system
  const ratingBonus = {
    10: 5,
    9: 4,
    8: 3,
    7: 2,
    6: 1,
  } as const

  const rating = Math.floor(playerStats.rating || 0)
  if (ratingBonus[rating as keyof typeof ratingBonus]) {
    points += ratingBonus[rating as keyof typeof ratingBonus]
  }

  // Appearance points (if they played)
  points += playerStats.appearance || playerStats.minutes_played > 0 ? 2 : 0

  // Assists
  points += (playerStats.assists || 0) * 3

  // Man of the Match
  points += playerStats.motm ? 3 : 0

  // Red card penalty
  points += playerStats.redCard || playerStats.red_cards ? -3 : 0

  // Position-specific scoring
  switch (position.toLowerCase()) {
    case "striker":
    case "forward":
    case "fwd":
    case "st":
      points += (playerStats.goals || 0) * 4
      break

    case "midfielder":
    case "mid":
    case "cm":
    case "cam":
    case "cdm":
    case "lm":
    case "rm":
      points += (playerStats.goals || 0) * 5
      points += playerStats.cleanSheet || playerStats.clean_sheet ? 2 : 0
      points += Math.floor((playerStats.possessionsWon || 0) / 2) * 1
      break

    case "defender":
    case "def":
    case "cb":
    case "lb":
    case "rb":
    case "lwb":
    case "rwb":
      points += (playerStats.goals || 0) * 6
      points += playerStats.cleanSheet || playerStats.clean_sheet ? 4 : 0
      points += Math.floor((playerStats.possessionsWon || 0) / 2) * 1
      points -= Math.floor((playerStats.goalsConceded || 0) / 2) * 1
      break

    case "goalkeeper":
    case "gk":
      points += (playerStats.goals || 0) * 10
      points += playerStats.cleanSheet || playerStats.clean_sheet ? 6 : 0
      points += Math.floor((playerStats.saves || 0) / 2) * 1
      points += (playerStats.penaltiesSaved || playerStats.penalty_saves || 0) * 5
      points -= Math.floor((playerStats.goalsConceded || 0) / 2) * 1
      break
  }

  return points
}

export const calculateTotalFantasyPoints = (
  allStats: PlayerMatchStats[],
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
): number => {
  return allStats.reduce((total, stats) => total + calculateFantasyPoints(stats, position), 0)
} 
