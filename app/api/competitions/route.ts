import { NextResponse } from "next/server"
import { executeQuery, handleSupabaseQuery } from '@/lib/utils/supabase-query'
import { createClient } from "@/lib/supabase/client"

// GET /api/competitions - Get all competitions or filter by query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const orderBy = searchParams.get('orderBy') || 'created_at'
    const ascending = searchParams.get('ascending') === 'true'
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = await createClient()

    const { data, count } = await executeQuery(
      supabase,
      'competitions',
      {
        page,
        limit,
        orderBy,
        ascending,
        filters: {
          ...(status && { status })
        },
        ...(search && {
          search: {
            term: search,
            fields: ['name', 'description']
          }
        })
      },
      `
        *,
        teams:competition_teams(
          team_id,
          team:team_id(id, name, logo_url),
          status
        ),
        matches(
          id,
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          status,
          scheduled_at
        )
      `
    )

    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/competitions - Create a new competition
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
          .from('competitions')
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
      'Failed to create competition'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/competitions - Update a competition
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { id, ...updates } = json

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
          .from('competitions')
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
      'Failed to update competition'
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/competitions - Delete a competition
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Competition ID is required' }, { status: 400 })
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
          .from('competitions')
          .delete()
          .eq('id', id)
        return {
          data: result.data,
          error: result.error,
          count: null
        }
      },
      'Failed to delete competition'
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
