import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Fetch all matches for the team
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        date,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status
      `)
      .or(`home_team_id.eq.${params.id},away_team_id.eq.${params.id}`)
      .eq('status', 'completed')
      .order('date', { ascending: false })

    if (matchesError) throw matchesError

    // Calculate performance metrics
    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0
    let cleanSheets = 0
    let form: Array<'W' | 'D' | 'L'> = []

    matches.forEach(match => {
      const isHome = match.home_team_id === params.id
      const teamScore = isHome ? match.home_score : match.away_score
      const opponentScore = isHome ? match.away_score : match.home_score

      if (teamScore > opponentScore) {
        wins++
        form.push('W')
      } else if (teamScore === opponentScore) {
        draws++
        form.push('D')
      } else {
        losses++
        form.push('L')
      }

      goalsFor += teamScore
      goalsAgainst += opponentScore
      if (opponentScore === 0) cleanSheets++
    })

    const performance = {
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      cleanSheets,
      points: wins * 3 + draws,
      form: form.slice(0, 5), // Last 5 matches
      recentResults: matches.slice(0, 5).map(match => {
        const isHome = match.home_team_id === params.id
        const teamScore = isHome ? match.home_score : match.away_score
        const opponentScore = isHome ? match.away_score : match.home_score
        let result: 'W' | 'D' | 'L'

        if (teamScore > opponentScore) result = 'W'
        else if (teamScore === opponentScore) result = 'D'
        else result = 'L'

        return {
          matchId: match.id,
          date: match.date,
          score: `${teamScore}-${opponentScore}`,
          result
        }
      })
    }

    return NextResponse.json(performance)
  } catch (error) {
    console.error('Error fetching team performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team performance' },
      { status: 500 }
    )
  }
} 