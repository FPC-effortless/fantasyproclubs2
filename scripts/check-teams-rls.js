const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTeamsRLS() {
  console.log('🔍 Checking teams table RLS policies...\n')

  try {
    // 1. Check RLS policies for teams table
    console.log('1. RLS Policies for teams table:')
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT * FROM pg_policies WHERE tablename = 'teams'" 
      })

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError)
      return
    }

    if (policies.length === 0) {
      console.log('   ⚠️  No RLS policies found for teams table')
    } else {
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`)
        console.log(`     Permissive: ${policy.permissive}`)
        console.log(`     Roles: ${policy.roles}`)
        console.log(`     Qual: ${policy.qual}`)
        console.log('')
      })
    }

    // 2. Check if RLS is enabled on teams table
    console.log('2. RLS status for teams table:')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'teams'" 
      })

    if (tableError) {
      console.log('   Trying alternative method...')
      // Alternative: Check using information_schema
      const { data: altTableInfo, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_name', 'teams')
        .eq('table_schema', 'public')

      if (altError) {
        console.error('❌ Error checking RLS status:', altError)
      } else {
        console.log('   Table exists in public schema:', altTableInfo.length > 0)
      }
    } else {
      console.log('   RLS enabled:', tableInfo[0]?.relrowsecurity || false)
    }

    // 3. Test actual data access with a regular client (like frontend would use)
    console.log('\n3. Testing data access with anon client:')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: anonTeams, error: anonError } = await anonClient
      .from('teams')
      .select('id, name')
      .limit(5)

    if (anonError) {
      console.log('   ❌ Anonymous access failed:', anonError.message)
    } else {
      console.log(`   ✅ Anonymous access works, returned ${anonTeams.length} teams`)
    }

    // 4. Test with authenticated user context
    console.log('\n4. Testing with authenticated context:')
    const { data: authTeams, error: authError } = await supabase
      .from('teams')
      .select(`
        *,
        manager:user_profiles!manager_id(
          id,
          full_name,
          email
        )
      `)
      .limit(5)

    if (authError) {
      console.log('   ❌ Authenticated access failed:', authError.message)
    } else {
      console.log(`   ✅ Authenticated access works, returned ${authTeams.length} teams`)
      authTeams.forEach(team => {
        console.log(`     - ${team.name} (Manager: ${team.manager?.full_name || 'None'})`)
      })
    }

    console.log('\n✅ RLS check complete!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkTeamsRLS() 