const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugCompetitions() {
  console.log('🔍 Debugging competitions and teams...\n')

  try {
    // Check competitions
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .order('name')

    if (compError) {
      console.error('❌ Error fetching competitions:', compError)
      return
    }

    console.log(`📊 Found ${competitions.length} competitions:`)
    competitions.forEach(comp => {
      console.log(`  - ${comp.name} (${comp.type}, ${comp.status})`)
    })
    console.log()

    // Check teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError)
      return
    }

    console.log(`👥 Found ${teams.length} teams:`)
    teams.forEach(team => {
      console.log(`  - ${team.name}`)
    })
    console.log()

    // Check competition_teams relationships
    const { data: compTeams, error: ctError } = await supabase
      .from('competition_teams')
      .select(`
        competition_id,
        team_id,
        competitions(name),
        teams(name)
      `)

    if (ctError) {
      console.error('❌ Error fetching competition_teams:', ctError)
      return
    }

    console.log(`🔗 Found ${compTeams.length} competition-team relationships:`)
    compTeams.forEach(ct => {
      console.log(`  - ${ct.competitions.name} ← → ${ct.teams.name}`)
    })

    if (compTeams.length === 0) {
      console.log('\n⚠️  NO TEAMS ARE ASSIGNED TO ANY COMPETITIONS!')
      console.log('   This is likely why you can\'t see teams in competitions.')
      console.log('   Use the "Manage Teams" button in the admin to assign teams.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugCompetitions() 