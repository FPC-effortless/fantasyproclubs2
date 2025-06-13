const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugTeams() {
  console.log('🔍 Debugging teams data...\n')

  try {
    // 1. Check if any teams exist at all
    console.log('1. Checking total teams count:')
    const { count: totalTeams, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error counting teams:', countError)
      return
    }
    
    console.log(`   Total teams in database: ${totalTeams}\n`)

    if (totalTeams === 0) {
      console.log('⚠️  No teams found in database! Need to create teams first.')
      return
    }

    // 2. Get basic team data without joins
    console.log('2. Basic teams data (without joins):')
    const { data: basicTeams, error: basicError } = await supabase
      .from('teams')
      .select('id, name, manager_id, created_at')
      .order('name')

    if (basicError) {
      console.error('❌ Error fetching basic teams:', basicError)
      return
    }

    console.log(`   Found ${basicTeams.length} teams:`)
    basicTeams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id}, Manager ID: ${team.manager_id || 'none'})`)
    })
    console.log('')

    // 3. Try the same query as the component (with join)
    console.log('3. Teams with manager join (same query as component):')
    const { data: teamsWithManagers, error: joinError } = await supabase
      .from('teams')
      .select(`
        *,
        manager:user_profiles!manager_id(
          id,
          full_name,
          email
        )
      `)
      .order('name')

    if (joinError) {
      console.error('❌ Error fetching teams with manager join:', joinError)
      return
    }

    console.log(`   Query with join returned ${teamsWithManagers.length} teams:`)
    teamsWithManagers.forEach(team => {
      console.log(`   - ${team.name}:`)
      console.log(`     Manager: ${team.manager ? team.manager.full_name || team.manager.email : 'None assigned'}`)
    })
    console.log('')

    // 4. Check user_profiles to see if there are potential managers
    console.log('4. Available user profiles:')
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, user_type')
      .order('full_name')

    if (profilesError) {
      console.error('❌ Error fetching user profiles:', profilesError)
      return
    }

    console.log(`   Found ${profiles.length} user profiles:`)
    profiles.forEach(profile => {
      console.log(`   - ${profile.full_name || profile.email} (${profile.user_type})`)
    })
    console.log('')

    // 5. Check if the difference in counts indicates an issue
    if (basicTeams.length !== teamsWithManagers.length) {
      console.log('⚠️  WARNING: Join query returns fewer teams than basic query!')
      console.log('   This suggests some teams are being filtered out by the join.')
      console.log('   Teams without valid manager_id references will be excluded.')
    }

    console.log('✅ Debug complete!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugTeams() 