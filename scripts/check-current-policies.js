const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkCurrentPolicies() {
  console.log('🔍 Checking current teams table situation...\n')

  // Test 1: Direct table access with service role
  console.log('1. Testing with SERVICE ROLE (should always work):')
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: serviceTeams, error: serviceError } = await serviceClient
    .from('teams')
    .select('id, name, manager_id')
    .limit(5)

  if (serviceError) {
    console.log('   ❌ Service role failed:', serviceError.message)
  } else {
    console.log(`   ✅ Service role works: ${serviceTeams.length} teams`)
  }

  // Test 2: Anon access
  console.log('\n2. Testing with ANON KEY (public access):')
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: anonTeams, error: anonError } = await anonClient
    .from('teams')
    .select('id, name, manager_id')
    .limit(5)

  if (anonError) {
    console.log('   ❌ Anon access failed:', anonError.message)
    console.log('   This means RLS is blocking unauthenticated access')
  } else {
    console.log(`   ✅ Anon access works: ${anonTeams.length} teams`)
  }

  // Test 3: Check if the admin user exists and can access user_profiles
  console.log('\n3. Testing admin user access:')
  
  const { data: adminUsers, error: adminError } = await serviceClient
    .from('user_profiles')
    .select('id, email, user_type')
    .eq('user_type', 'admin')
    .limit(3)

  if (adminError) {
    console.log('   ❌ Cannot access user_profiles:', adminError.message)
  } else {
    console.log(`   ✅ Found ${adminUsers.length} admin users:`)
    adminUsers.forEach(user => {
      console.log(`     - ${user.email}`)
    })
  }

  // Test 4: Check user_profiles access with anon key
  console.log('\n4. Testing user_profiles access with anon key:')
  const { data: anonProfiles, error: anonProfilesError } = await anonClient
    .from('user_profiles')
    .select('id, email, user_type')
    .limit(3)

  if (anonProfilesError) {
    console.log('   ❌ Anon cannot access user_profiles:', anonProfilesError.message)
  } else {
    console.log(`   ✅ Anon can access user_profiles: ${anonProfiles.length} profiles`)
  }

  console.log('\n📋 SUMMARY:')
  console.log('The issue is likely one of these:')
  console.log('1. You need to be logged in as an admin user in the browser')
  console.log('2. The frontend authentication state is not working properly')
  console.log('3. RLS policies are too restrictive')
  console.log('\n🔧 NEXT STEPS:')
  console.log('1. Go to http://localhost:3001/auth/login')
  console.log('2. Log in with admin credentials (jeffwilly1997@gmail.com)')
  console.log('3. Then try the teams management again')
  console.log('4. Check browser console for any authentication errors')
}

checkCurrentPolicies() 