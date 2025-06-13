const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixTeamsRLS() {
  console.log('🔧 Fixing teams table RLS policies...\n')

  try {
    // First, drop existing policies
    console.log('1. Dropping existing teams policies...')
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams',
      'DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams',
      'DROP POLICY IF EXISTS "Teams can be updated by their manager" ON teams',
      'DROP POLICY IF EXISTS "Teams can be deleted by their manager" ON teams',
      'DROP POLICY IF EXISTS "Teams can be managed by admins" ON teams'
    ]

    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        console.log(`   ⚠️  Warning dropping policy: ${error.message}`)
      }
    }

    // Enable RLS
    console.log('2. Ensuring RLS is enabled...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE teams ENABLE ROW LEVEL SECURITY'
    })
    if (rlsError) {
      console.log(`   ⚠️  RLS enable warning: ${rlsError.message}`)
    }

    // Create new policies
    console.log('3. Creating new teams policies...')
    
    const newPolicies = [
      // Allow public read access
      `CREATE POLICY "Teams are viewable by everyone" 
       ON teams FOR SELECT 
       USING (true)`,

      // Allow admins full access
      `CREATE POLICY "Teams can be managed by admins" 
       ON teams FOR ALL 
       TO authenticated 
       USING (
         EXISTS (
           SELECT 1 FROM public.user_profiles
           WHERE user_profiles.id = auth.uid()
           AND user_profiles.user_type = 'admin'
         )
       )`,

      // Allow team managers to update their teams
      `CREATE POLICY "Teams can be updated by their manager" 
       ON teams FOR UPDATE 
       TO authenticated 
       USING (auth.uid() = manager_id) 
       WITH CHECK (auth.uid() = manager_id)`,

      // Allow team managers to delete their teams
      `CREATE POLICY "Teams can be deleted by their manager" 
       ON teams FOR DELETE 
       TO authenticated 
       USING (auth.uid() = manager_id)`,

      // Allow team creation
      `CREATE POLICY "Teams can be created by authenticated users" 
       ON teams FOR INSERT 
       TO authenticated 
       WITH CHECK (
         auth.uid() = manager_id OR
         EXISTS (
           SELECT 1 FROM public.user_profiles
           WHERE user_profiles.id = auth.uid()
           AND user_profiles.user_type = 'admin'
         )
       )`
    ]

    for (const sql of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        console.error(`   ❌ Error creating policy: ${error.message}`)
        return
      } else {
        console.log(`   ✅ Policy created successfully`)
      }
    }

    // Test the fix
    console.log('\n4. Testing the fix...')
    
    // Test with service role
    const { data: serviceTest, error: serviceError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(3)

    if (serviceError) {
      console.log('   ❌ Service role test failed:', serviceError.message)
    } else {
      console.log(`   ✅ Service role test passed: ${serviceTest.length} teams`)
    }

    // Test with anon key
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: anonTest, error: anonError } = await anonClient
      .from('teams')
      .select('id, name')
      .limit(3)

    if (anonError) {
      console.log('   ❌ Anon test failed:', anonError.message)
    } else {
      console.log(`   ✅ Anon test passed: ${anonTest.length} teams`)
    }

    console.log('\n✅ Teams RLS policies fixed!')
    console.log('\nNext steps:')
    console.log('1. Refresh your browser at http://localhost:3001/admin/competitions')
    console.log('2. Make sure you\'re logged in as an admin')
    console.log('3. Try clicking "Manage Teams" again')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixTeamsRLS() 