const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testTeamsAccess() {
  console.log('🔍 Testing teams access...\n')

  // Test with service role (should always work)
  console.log('1. Testing with SERVICE ROLE key:')
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: serviceTeams, error: serviceError } = await serviceClient
    .from('teams')
    .select(`
      id, 
      name, 
      manager_id,
      manager:user_profiles!manager_id(
        id,
        full_name,
        email
      )
    `)
    .limit(3)

  if (serviceError) {
    console.log('   ❌ Service role failed:', serviceError.message)
  } else {
    console.log(`   ✅ Service role works: ${serviceTeams.length} teams`)
    serviceTeams.forEach(team => {
      console.log(`     - ${team.name} (Manager: ${team.manager?.full_name || 'None'})`)
    })
  }

  // Test with anon key (what frontend uses when not authenticated)
  console.log('\n2. Testing with ANON key (unauthenticated):')
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: anonTeams, error: anonError } = await anonClient
    .from('teams')
    .select(`
      id, 
      name, 
      manager_id,
      manager:user_profiles!manager_id(
        id,
        full_name,
        email
      )
    `)
    .limit(3)

  if (anonError) {
    console.log('   ❌ Anon access failed:', anonError.message)
    console.log('   This means RLS is blocking unauthenticated access')
  } else {
    console.log(`   ✅ Anon access works: ${anonTeams.length} teams`)
  }

  // Test authenticated access by getting an admin user token
  console.log('\n3. Testing with AUTHENTICATED user:')
  
  // First, find an admin user
  const { data: adminUser, error: adminError } = await serviceClient
    .from('user_profiles')
    .select('id, email, user_type')
    .eq('user_type', 'admin')
    .limit(1)
    .single()

  if (adminError) {
    console.log('   ❌ No admin user found:', adminError.message)
    return
  }

  console.log(`   Found admin user: ${adminUser.email}`)

  // Try to simulate authenticated access by setting the auth context
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Note: We can't easily test this without actual login, but we can check RLS
  console.log('   (Note: Full auth test would require actual login)')

  console.log('\n✅ Test complete!')
  console.log('\nNext steps:')
  console.log('1. Open browser console at http://localhost:3001/admin/competitions')
  console.log('2. Click "Manage Teams" on any competition')
  console.log('3. Check console for errors')
  console.log('4. If teams don\'t load, the issue is likely RLS policies')
}

testTeamsAccess() 