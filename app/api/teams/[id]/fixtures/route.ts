import { createClient } from "@/lib/supabase/server"
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        date,
        home_team:home_team_id(id, name),
        away_team:away_team_id(id, name),
        competition:competition_id(id, name),
        home_score,
        away_score,
        status
      `)
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .order('date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team fixtures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team fixtures' },
      { status: 500 }
    )
  }
} 