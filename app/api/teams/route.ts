import { createClient } from "@/lib/supabase/server"
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { executeQuery, handleSupabaseQuery } from '@/lib/utils/supabase-query'

// GET /api/teams - Get all teams or filter by query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const orderBy = searchParams.get('orderBy') || 'created_at'
    const ascending = searchParams.get('ascending') === 'true'
    const competitionId = searchParams.get('competition_id')
    const managerId = searchParams.get('manager_id')
    const search = searchParams.get('search')

    const supabase = await createClient()

    const { data, count } = await executeQuery(
      supabase,
      'teams',
      {
        page,
        limit,
        orderBy,
        ascending,
        filters: {
          ...(competitionId && {
            'competition_teams.competition_id': competitionId
          }),
          ...(managerId && { manager_id: managerId })
        },
        ...(search && {
          search: {
            term: search,
            fields: ['name', 'short_name', 'description']
          }
        })
      },
      `
        *,
        manager:manager_id(id, username, avatar_url),
        players(id, user_id, position, number, status),
        competition_teams!inner(competition_id)
      `
    )

    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/teams - Create a new team
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('teams')
          .insert({
            ...json,
            manager_id: user.id
          })
          .select()
          .single()
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to create team'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/teams - Update a team
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { id, ...updates } = json

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is team manager
    const { data: team } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('teams')
          .select('manager_id')
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

    if (!team?.manager_id || team.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('teams')
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
      'Failed to update team'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/teams - Delete a team
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is team manager
    const { data: team } = await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('teams')
          .select('manager_id')
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

    if (!team?.manager_id || team.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await handleSupabaseQuery(
      supabase,
      async () => {
        const result = await supabase
          .from('teams')
          .delete()
          .eq('id', id)
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to delete team'
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
