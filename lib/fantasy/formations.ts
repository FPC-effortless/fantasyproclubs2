// Fantasy formations - Only 8 allowed formations for fantasy lineups
// Real teams can use any EA FC formation, but fantasy is restricted to these 8

export interface FantasyFormation {
  name: string
  positions: {
    GK: number
    DEF: number
    MID: number
    FWD: number
  }
  description: string
}

export const FANTASY_FORMATIONS: FantasyFormation[] = [
  {
    name: "4-4-2",
    positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    description: "Balanced formation with solid midfield"
  },
  {
    name: "4-3-3",
    positions: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    description: "Attacking formation with wide forwards"
  },
  {
    name: "4-5-1",
    positions: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    description: "Defensive formation with packed midfield"
  },
  {
    name: "3-5-2",
    positions: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    description: "Modern formation with wing-backs"
  },
  {
    name: "3-4-3",
    positions: { GK: 1, DEF: 3, MID: 4, FWD: 3 },
    description: "Attack-minded with three center-backs"
  },
  {
    name: "5-3-2",
    positions: { GK: 1, DEF: 5, MID: 3, FWD: 2 },
    description: "Ultra-defensive with five defenders"
  },
  {
    name: "4-2-3-1",
    positions: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    description: "Modern attacking formation (CAM counted as MID)"
  },
  {
    name: "3-4-2-1",
    positions: { GK: 1, DEF: 3, MID: 6, FWD: 1 },
    description: "Creative formation with dual CAMs (CAMs counted as MID)"
  }
]

// Position role mapping - maps real positions to fantasy roles
export const POSITION_TO_FANTASY_ROLE: Record<string, 'GK' | 'DEF' | 'MID' | 'FWD'> = {
  // Goalkeeper
  'GK': 'GK',
  
  // Defenders
  'CB': 'DEF',
  'LB': 'DEF',
  'RB': 'DEF',
  'LWB': 'DEF',
  'RWB': 'DEF',
  
  // Midfielders (includes attacking mids)
  'CDM': 'MID',
  'CM': 'MID',
  'CAM': 'MID',
  'LM': 'MID',
  'RM': 'MID',
  'LW': 'MID',
  'RW': 'MID',
  
  // Forwards
  'ST': 'FWD',
  'CF': 'FWD',
}

// Validation function for fantasy lineups
export function isLineupValid(lineup: any[], formationKey: string): boolean {
  const expected = FANTASY_FORMATIONS.find(f => f.name === formationKey)
  if (!expected) return false

  const count = { GK: 0, DEF: 0, MID: 0, FWD: 0 }

  lineup.forEach(player => {
    const fantasyRole = POSITION_TO_FANTASY_ROLE[player.position] || 
                       POSITION_TO_FANTASY_ROLE[player.fantasyRole] || 
                       player.fantasyRole
    if (fantasyRole && count[fantasyRole] !== undefined) {
      count[fantasyRole]++
    }
  })

  return (
    count.GK === expected.positions.GK &&
    count.DEF === expected.positions.DEF &&
    count.MID === expected.positions.MID &&
    count.FWD === expected.positions.FWD
  )
}

// Get formation requirements
export function getFormationRequirements(formationKey: string) {
  return FANTASY_FORMATIONS.find(f => f.name === formationKey)?.positions
}

// Convert real position to fantasy role
export function getFantasyRole(realPosition: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  return POSITION_TO_FANTASY_ROLE[realPosition.toUpperCase()] || 'MID'
} 