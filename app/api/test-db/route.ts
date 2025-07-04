import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const results: Record<string, any> = {}

    // Test each table
    const tables = ['fixtures', 'teams', 'competitions', 'countries', 'news', 'featured_matches']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .single()

      results[table] = {
        success: !error,
        count: data?.count,
        error: error ? {
          message: error.message,
          code: error.code,
          hint: error.hint
        } : null
      }
    }

    // Also test a simple query to check permissions
    const { error: queryError } = await supabase
      .from('fixtures')
      .select(`
        id,
        home_team:team_id_home(id, name),
        away_team:team_id_away(id, name)
      `)
      .limit(1)

    if (queryError) {
      results.complexQuery = {
        success: false,
        error: {
          message: queryError.message,
          code: queryError.code,
          hint: queryError.hint
        }
      }
    }

    // Check if any table had an error
    const hasErrors = Object.values(results).some(r => !r.success)

    if (hasErrors) {
      return NextResponse.json({ 
        success: false,
        message: 'Some database checks failed',
        results 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'All database checks passed',
      results
    })

  } catch (error: any) {
    console.error('Test route error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
} 
