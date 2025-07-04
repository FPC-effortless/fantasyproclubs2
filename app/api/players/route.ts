import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

// GET /api/players - Get all players or filter by query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('team_id')
    const userId = searchParams.get('user_id')
    const position = searchParams.get('position')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()
    let query = supabase.from('players').select(`
      *,
      user:user_id(
        id,
        username,
        avatar_url,
        gaming->xbox_gamertag,
        gaming->psn_id,
        gaming->preferred_platform
      ),
      team:team_id(
        id,
        name,
        logo_url
      )
    `)

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (position) {
      query = query.eq('position', position)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/players - Create a new player
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is team manager
    const { data: team } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', json.team_id)
      .single()

    if (!team?.manager_id || team.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        ...json,
        user_id: json.user_id || user.id // Allow creating for other users if specified
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/players - Update a player
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { id, ...updates } = json

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player and team info
    const { data: player } = await supabase
      .from('players')
      .select(`
        user_id,
        team:team_id(manager_id)
      `)
      .eq('id', id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if user is the player or team manager
    if (player.user_id !== user.id && (player.team as any)?.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/players - Delete a player
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player and team info
    const { data: player } = await supabase
      .from('players')
      .select(`
        user_id,
        team:team_id(manager_id)
      `)
      .eq('id', id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if user is the player or team manager
    if (player.user_id !== user.id && (player.team as any)?.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
