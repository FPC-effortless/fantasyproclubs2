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
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        description,
        manager_id,
        manager:manager_id(username, avatar_url),
        members:players(
          id,
          user_id,
          position,
          number,
          status,
          user:user_id(username, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
} 