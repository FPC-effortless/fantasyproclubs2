const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugCompetitionTeams() {
  console.log('🔍 Debugging competition teams display...\n')

  try {
    // 1. Check if any competition_teams exist
    console.log('1. Checking competition_teams table:')
    const { data: allCompTeams, error: ctError } = await supabase
      .from('competition_teams')
      .select('*')
      .limit(10)

    if (ctError) {
      console.error('   ❌ Error accessing competition_teams:', ctError.message)
      return
    }

    console.log(`   Found ${allCompTeams.length} competition_team records:`)
    allCompTeams.forEach(ct => {
      console.log(`   - Competition ${ct.competition_id} has team ${ct.team_id}`)
    })

    // 2. Check the exact query that the frontend uses
    console.log('\n2. Testing the frontend query (with service role):')
    const { data: competitionsData, error: competitionsError } = await supabase
      .from('competitions')
      .select(`
        id,
        name,
        type,
        status,
        start_date,
        end_date,
        max_teams,
        created_at,
        updated_at,
        competition_teams (
          team_id,
          teams (
            id,
            name,
            created_at,
            updated_at
          )
        ),
        matches (
          id,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (competitionsError) {
      console.error('   ❌ Frontend query failed:', competitionsError.message)
      return
    }

    console.log(`   ✅ Frontend query returned ${competitionsData.length} competitions:`)
    competitionsData.forEach(comp => {
      console.log(`   - ${comp.name}:`)
      console.log(`     Teams: ${comp.competition_teams?.length || 0}`)
      if (comp.competition_teams && comp.competition_teams.length > 0) {
        comp.competition_teams.forEach(ct => {
          console.log(`       * ${ct.teams?.name || 'Unknown team'}`)
        })
      }
    })

    // 3. Test with anon client (like frontend)
    console.log('\n3. Testing with anon client (frontend simulation):')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: anonCompetitions, error: anonError } = await anonClient
      .from('competitions')
      .select(`
        id,
        name,
        competition_teams (
          team_id,
          teams (
            id,
            name
          )
        )
      `)
      .limit(3)

    if (anonError) {
      console.log('   ❌ Anon query failed:', anonError.message)
      console.log('   This means RLS is blocking the query')
    } else {
      console.log(`   ✅ Anon query worked: ${anonCompetitions.length} competitions`)
      anonCompetitions.forEach(comp => {
        console.log(`   - ${comp.name}: ${comp.competition_teams?.length || 0} teams`)
      })
    }

    // 4. Check competition_teams RLS policies issue
    console.log('\n4. Checking competition_teams table access:')
    const { data: anonCT, error: anonCTError } = await anonClient
      .from('competition_teams')
      .select('competition_id, team_id')
      .limit(5)

    if (anonCTError) {
      console.log('   ❌ Anon cannot access competition_teams:', anonCTError.message)
      console.log('   This is the problem! Need to fix competition_teams RLS')
    } else {
      console.log(`   ✅ Anon can access competition_teams: ${anonCT.length} records`)
    }

    console.log('\n📋 DIAGNOSIS:')
    if (anonCTError) {
      console.log('The issue is that competition_teams table has RLS that blocks public access.')
      console.log('This prevents the join from working in the competitions query.')
      console.log('\n🔧 SOLUTION:')
      console.log('Add a public read policy to competition_teams table.')
    } else {
      console.log('RLS seems fine. The issue might be elsewhere.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugCompetitionTeams() 