import { executeQuery, handleSupabaseQuery } from "@/lib/utils/supabase-query"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

// GET /api/matches - Get all matches or filter by query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const orderBy = searchParams.get('orderBy') || 'scheduled_at'
    const ascending = searchParams.get('ascending') === 'true'
    const competitionId = searchParams.get('competition_id')
    const teamId = searchParams.get('team_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = await createClient()

    const { data, count } = await executeQuery(
      supabase,
      'matches',
      {
        page,
        limit,
        orderBy,
        ascending,
        filters: {
          ...(competitionId && { competition_id: competitionId }),
          ...(teamId && {
            or: `home_team_id.eq.${teamId},away_team_id.eq.${teamId}`
          }),
          ...(status && { status })
        },
        ...(search && {
          search: {
            term: search,
            fields: ['notes']
          }
        })
      },
      `
        *,
        competition:competition_id(id, name),
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url),
        match_events(
          id,
          type,
          minute,
          player_id,
          team_id,
          details
        )
      `
    )

    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/matches - Create a new match
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to verify user type'
    )

    if (!userProfile?.user_type || userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('matches')
          .insert({
            ...json,
            created_by: user.id
          })
          .select()
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to create match'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/matches - Update a match
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { id, ...updates } = json

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or team manager
    const { data: userProfile } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to verify user type'
    )

    if (!userProfile?.user_type || userProfile.user_type !== 'admin') {
      // Check if user is manager of either team
      const { data: match } = await handleSupabaseQuery(
        supabase,
        async () => {
          const result = await supabase
            .from('matches')
            .select(`
              home_team:home_team_id(manager_id),
              away_team:away_team_id(manager_id)
            `)
            .eq('id', id)
            .single()
          return {
            data: result.data,
            error: result.error,
            count: null
          }
        },
        'Failed to verify team manager'
      )

      if (!match?.home_team || !match?.away_team || 
          ((match.home_team as any)?.manager_id !== user.id && (match.away_team as any)?.manager_id !== user.id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { data } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('matches')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to update match'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/matches - Delete a match
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to verify user type'
    )

    if (!userProfile?.user_type || userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('matches')
          .delete()
          .eq('id', id)
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to delete match'
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
