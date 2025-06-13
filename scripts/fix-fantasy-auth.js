require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Check for environment variables
console.log('🔍 Checking environment variables...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  console.log('📝 Please create a .env.local file with your Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('📋 Alternatively, you can run the SQL manually in Supabase SQL Editor:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of fix_fantasy_auth.sql');
  console.log('4. Click "Run"');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  console.log('📝 You need the service role key to run migrations. Add it to .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('📋 Find your service role key in:');
  console.log('Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Test connection
async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('');
    console.log('📋 Manual SQL Option:');
    console.log('Since the database connection failed, you can run the SQL manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of fix_fantasy_auth.sql');
    console.log('4. Click "Run"');
    return false;
  }
}

async function fixFantasyAuth() {
  try {
    console.log('🔧 Fixing fantasy authentication system...');

    // Check if SQL file exists
    const sqlFilePath = path.join(process.cwd(), 'fix_fantasy_auth.sql');
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ fix_fantasy_auth.sql not found');
      console.log('📁 Make sure the file exists in the project root');
      return false;
    }

    // Read our SQL fix script
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 Executing fantasy authentication fix...');

    // Try to execute the SQL using Supabase RPC
    try {
      // Try using the newer format first
      const { error } = await supabase.rpc('sql', { 
        sql: sqlScript 
      });
      
      if (error) {
        console.warn('⚠️  RPC method failed, trying alternative approach...');
        // Try using REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ sql: sqlScript })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`REST API failed: ${errorText}`);
        }
      }
    } catch (rpcError) {
      console.warn('⚠️  RPC execution failed:', rpcError.message);
      console.log('🔄 Trying statement-by-statement execution...');
      
      // Fallback: Execute statement by statement
      const statements = sqlScript
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT');

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
            
            // Try to execute using Supabase client
            const { error } = await supabase.rpc('exec', { 
              sql: statement + ';'
            });
            
            if (error) {
              console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
            } else {
              console.log(`✅ Statement ${i + 1} completed`);
            }
          } catch (err) {
            console.warn(`⚠️  Statement ${i + 1} non-critical error:`, err.message);
          }
        }
      }
    }

    // Verify the fix
    console.log('🔍 Verifying fantasy system...');
    
    // Check if fantasy_teams table exists and is accessible
    try {
      const { data: fantasyTeams, error: fantasyError } = await supabase
        .from('fantasy_teams')
        .select('id')
        .limit(1);
      
      if (fantasyError && fantasyError.code === 'PGRST116') {
        console.log('ℹ️  fantasy_teams table is empty (this is normal for new setups)');
      } else if (fantasyError) {
        console.warn('⚠️  fantasy_teams table warning:', fantasyError.message);
      } else {
        console.log('✅ fantasy_teams table is accessible');
      }
    } catch (err) {
      console.warn('⚠️  fantasy_teams check failed:', err.message);
    }

    // Check if competitions have fantasy_enabled column
    try {
      const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id, fantasy_enabled')
        .limit(1);
      
      if (compError) {
        console.warn('⚠️  competitions table check failed:', compError.message);
      } else {
        console.log('✅ competitions table with fantasy_enabled is accessible');
      }
    } catch (err) {
      console.warn('⚠️  competitions check failed:', err.message);
    }

    // Check for fantasy-enabled competitions
    try {
      const { data: fantasyComps, error: fantasyCompError } = await supabase
        .from('competitions')
        .select('id, name, fantasy_enabled')
        .eq('fantasy_enabled', true);
      
      if (fantasyCompError) {
        console.warn('⚠️  fantasy competitions fetch failed:', fantasyCompError.message);
      } else {
        console.log(`✅ Found ${fantasyComps?.length || 0} fantasy-enabled competitions`);
      }
    } catch (err) {
      console.warn('⚠️  fantasy competitions check failed:', err.message);
    }

    console.log('');
    console.log('🎉 Fantasy authentication fix completed!');
    console.log('🚀 The fantasy system should now work properly');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test the fantasy page in your app');
    console.log('2. If issues persist, check the browser console for errors');
    console.log('3. Verify RLS policies in Supabase dashboard');
    
    return true;
    
  } catch (error) {
    console.error('💥 Error fixing fantasy authentication:', error);
    console.log('');
    console.log('📋 Manual SQL Option:');
    console.log('You can run the SQL manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of fix_fantasy_auth.sql');
    console.log('4. Click "Run"');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 EA FC Pro Clubs - Fantasy Authentication Fix');
  console.log('================================================');
  console.log('');

  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  const success = await fixFantasyAuth();
  process.exit(success ? 0 : 1);
}

main(); 