import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('teams')
      .select(
        `id, name, logo_url`
      )
      .order('name')

    if (error) {
      console.error('Public teams API error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Public teams API unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 