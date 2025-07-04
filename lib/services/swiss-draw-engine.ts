import { createClient } from "@/lib/supabase/client"


interface Team {
  id: string
  name: string
}

interface DrawConfig {
  competitionId: string
  number_of_teams: number
  matches_per_team: number
  same_country_restriction: boolean
  home_away_balance: boolean
  exclusions: Array<{
    teamA: string
    teamB: string
    reason?: string
  }>
}

interface DrawMatch {
  round_id: string
  home_team_id: string
  away_team_id: string
  match_date: string | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
}

interface DrawResult {
  success: boolean
  matches: DrawMatch[]
  error?: string
  log: string[]
}

interface CompetitionTeamWithTeam {
  team_id: string
  teams: {
    id: string
    name: string
    country: string
  }
}

interface DatabaseTeam {
  id: string
  name: string
  country: string
}

interface PotEntry {
  team_id: string
  pot_number: number
  coefficient: number
  teams: DatabaseTeam
}

export class SwissDrawEngine {
  private supabase
  private drawLog: string[] = []

  constructor() {
    this.supabase = createClient()
  }

  private log(message: string) {
    this.drawLog.push(`${new Date().toISOString()}: ${message}`)
    console.log(message) // Add console logging for debugging
  }

  private async getTeamsInPots(competitionId: string): Promise<Team[]> {
    try {
      // First get the team IDs from competition_teams
      const { data: teamIds, error: teamIdsError } = await this.supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (teamIdsError) {
        this.log(`Error fetching team IDs: ${teamIdsError.message}`)
        throw teamIdsError
      }

      if (!teamIds || teamIds.length === 0) {
        this.log(`No teams found for competition ${competitionId}`)
        return []
      }

      // Then get the team details
      const { data: teams, error: teamsError } = await this.supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds.map(t => t.team_id))

      if (teamsError) {
        this.log(`Error fetching teams: ${teamsError.message}`)
        throw teamsError
      }

      if (!teams) {
        this.log(`No team details found`)
        return []
      }

      this.log(`Found ${teams.length} teams in competition ${competitionId}`)
      return teams
    } catch (error: any) {
      this.log(`Error in getTeamsInPots: ${error.message}`)
      throw error
    }
  }

  private isValidOpponent(
    teamA: Team,
    teamB: Team,
    config: DrawConfig,
    existingMatches: DrawMatch[],
    round: number
  ): boolean {
    // Same team check
    if (teamA.id === teamB.id) {
      this.log(`${teamA.name} cannot play against itself`)
      return false
    }

    // Custom exclusions check
    const isExcluded = config.exclusions.some(
      exclusion =>
        (exclusion.teamA === teamA.id && exclusion.teamB === teamB.id) ||
        (exclusion.teamA === teamB.id && exclusion.teamB === teamA.id)
    )
    if (isExcluded) {
      this.log(`${teamA.name} and ${teamB.name} are excluded from playing each other`)
      return false
    }

    // Already played check
    const alreadyPlayed = existingMatches.some(
      match =>
        (match.home_team_id === teamA.id && match.away_team_id === teamB.id) ||
        (match.home_team_id === teamB.id && match.away_team_id === teamA.id)
    )
    if (alreadyPlayed) {
      this.log(`${teamA.name} and ${teamB.name} have already played each other`)
      return false
    }

    return true
  }

  private assignHomeAway(
    teamA: Team,
    teamB: Team,
    existingMatches: DrawMatch[],
    config: DrawConfig
  ): { home_team_id: string; away_team_id: string } {
    const teamAHomeGames = existingMatches.filter(m => m.home_team_id === teamA.id).length
    const teamBHomeGames = existingMatches.filter(m => m.home_team_id === teamB.id).length
    const maxHomeGames = Math.ceil(config.matches_per_team / 2)

    if (!config.home_away_balance) {
      // If home/away balance is disabled, randomly assign
      return Math.random() < 0.5
        ? { home_team_id: teamA.id, away_team_id: teamB.id }
        : { home_team_id: teamB.id, away_team_id: teamA.id }
    }

    // If one team has reached max home games, the other team should be home
    if (teamAHomeGames >= maxHomeGames && teamBHomeGames < maxHomeGames) {
      return { home_team_id: teamB.id, away_team_id: teamA.id }
    }
    if (teamBHomeGames >= maxHomeGames && teamAHomeGames < maxHomeGames) {
      return { home_team_id: teamA.id, away_team_id: teamB.id }
    }

    // If both teams have reached max or neither has, prefer the team with fewer home games
    if (teamAHomeGames !== teamBHomeGames) {
      return teamAHomeGames < teamBHomeGames
        ? { home_team_id: teamA.id, away_team_id: teamB.id }
        : { home_team_id: teamB.id, away_team_id: teamA.id }
    }

    // If equal home games, randomly assign
    return Math.random() < 0.5
      ? { home_team_id: teamA.id, away_team_id: teamB.id }
      : { home_team_id: teamB.id, away_team_id: teamA.id }
  }

  public async runDraw(config: DrawConfig): Promise<DrawResult> {
    this.drawLog = []
    this.log('Starting Swiss model draw')

    try {
      const teams = await this.getTeamsInPots(config.competitionId)
      if (teams.length !== config.number_of_teams) {
        const error = new Error(`Expected ${config.number_of_teams} teams but found ${teams.length}`)
        this.log(error.message)
        return {
          success: false,
          matches: [],
          error: error.message,
          log: this.drawLog
        }
      }

      const matches: DrawMatch[] = []
      const totalRounds = config.matches_per_team
      
      for (let round = 1; round <= totalRounds; round++) {
        this.log(`Starting round ${round}`)
        const roundMatches: DrawMatch[] = []
        const availableTeams = [...teams]

        while (availableTeams.length >= 2) {
          const teamA = availableTeams.splice(Math.floor(Math.random() * availableTeams.length), 1)[0]
          let validOpponentFound = false

          for (let i = 0; i < availableTeams.length; i++) {
            const teamB = availableTeams[i]
            if (this.isValidOpponent(teamA, teamB, config, matches, round)) {
              // Valid pairing found
              const { home_team_id, away_team_id } = this.assignHomeAway(teamA, teamB, matches, config)
              
              roundMatches.push({
                round_id: round.toString(),
                home_team_id,
                away_team_id,
                match_date: null,
                status: 'scheduled'
              })

              availableTeams.splice(i, 1)
              validOpponentFound = true
              this.log(`Matched ${teamA.name} vs ${teamB.name}`)
              break
            }
          }

          if (!validOpponentFound) {
            // No valid opponent found, backtrack
            this.log(`No valid opponent found for ${teamA.name}, backtracking...`)
            if (roundMatches.length === 0) {
              const error = new Error(`Unable to find valid pairings for round ${round}`)
              this.log(error.message)
              return {
                success: false,
                matches: [],
                error: error.message,
                log: this.drawLog
              }
            }
            const lastMatch = roundMatches.pop()!
            availableTeams.push(
              teams.find(t => t.id === lastMatch.home_team_id)!,
              teams.find(t => t.id === lastMatch.away_team_id)!
            )
          }
        }

        matches.push(...roundMatches)
      }

      this.log('Draw completed successfully')
      
      return {
        success: true,
        matches,
        log: this.drawLog
      }
    } catch (error: any) {
      this.log(`Error: ${error.message || 'Unknown error occurred'}`)
      
      return {
        success: false,
        matches: [],
        error: error.message || 'Unknown error occurred',
        log: this.drawLog
      }
    }
  }

  public async saveDrawResults(
    competitionId: string,
    matches: DrawMatch[]
  ): Promise<void> {
    try {
      // First, create the rounds
      const rounds = [...new Set(matches.map(m => m.round_id))]
      
      for (const roundNumber of rounds) {
        this.log(`Creating round ${roundNumber}...`)
        const { data: roundsData, error: roundsError } = await this.supabase
          .from('swiss_model_rounds')
          .insert({
            competition_id: competitionId,
            round_number: parseInt(roundNumber),
            status: 'pending'
          })
          .select()

        if (roundsError) {
          this.log(`Error creating round ${roundNumber}: ${roundsError.message}`)
          throw new Error(`Failed to create round ${roundNumber}: ${roundsError.message}`)
        }

        if (!roundsData || roundsData.length === 0) {
          const error = new Error(`Failed to create round ${roundNumber}: No data returned`)
          this.log(error.message)
          throw error
        }

        const roundId = roundsData[0].id
        this.log(`Created round ${roundNumber} with ID ${roundId}`)

        const matchInserts = matches
          .filter(match => match.round_id === roundNumber)
          .map(match => ({
            competition_id: competitionId,
            round_id: roundId,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            status: match.status
          }))

        this.log(`Inserting ${matchInserts.length} matches for round ${roundNumber}...`)
        const { error: matchesError } = await this.supabase
          .from('swiss_model_matches')
          .insert(matchInserts)

        if (matchesError) {
          this.log(`Error creating matches for round ${roundNumber}: ${matchesError.message}`)
          throw new Error(`Failed to create matches for round ${roundNumber}: ${matchesError.message}`)
        }

        this.log(`Successfully created round ${roundNumber} with ${matchInserts.length} matches`)
      }

      this.log('Successfully saved all draw results')
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred'
      this.log(`Error saving draw results: ${errorMessage}`)
      throw new Error(`Failed to save draw results: ${errorMessage}`)
    }
  }
} 
