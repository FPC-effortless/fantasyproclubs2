import { NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/client"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        user_id,
        position,
        number,
        status,
        user:user_id(
          username,
          avatar_url
        )
      `)
      .eq('team_id', id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
} 