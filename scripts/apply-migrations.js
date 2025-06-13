require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for migrations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function makeHttpRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => { responseData += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
        }
      })
    })

    req.on('error', reject)
    if (data) {
      req.write(data)
    }
    req.end()
  })
}

async function executeSql(sql) {
  const projectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)[1]
  const options = {
    hostname: `${projectRef}.supabase.co`,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  }

  try {
    await makeHttpRequest(options, JSON.stringify({ sql_query: sql }))
  } catch (error) {
    if (error.message.includes('PGRST202')) {
      // If the function doesn't exist, create it
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;
      `
      
      // Try to create the function using direct SQL
      const directOptions = {
        hostname: `${projectRef}.supabase.co`,
        path: '/rest/v1/sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }

      await makeHttpRequest(directOptions, JSON.stringify({ query: createFunctionSql }))
      
      // Try the original query again
      await makeHttpRequest(options, JSON.stringify({ sql_query: sql }))
    } else {
      throw error
    }
  }
}

async function applyMigrations() {
  console.log('Applying database migrations...')
  
  try {
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    const files = fs.readdirSync(migrationsDir).sort()
    
    // Create migrations table if it doesn't exist
    const createMigrationsTableSql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    console.log('Creating migrations table...')
    await executeSql(createMigrationsTableSql)
    console.log('✅ Migrations table created successfully')

    // Get already executed migrations
    const { data: executedMigrations, error: migrationsError } = await supabase
      .from('migrations')
      .select('name')

    if (migrationsError) {
      console.error('Error fetching executed migrations:', migrationsError)
      throw migrationsError
    }

    const executedMigrationNames = new Set((executedMigrations || []).map(m => m.name))
    
    // Apply all migrations that haven't been executed yet
    for (const file of files) {
      if (!file.endsWith('.sql')) continue
      if (executedMigrationNames.has(file)) {
        console.log(`Skipping already executed migration: ${file}`)
        continue
      }
      
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      console.log(`Applying migration: ${file}`)
      await executeSql(sql)

      // Record the migration
      const { error: recordError } = await supabase
        .from('migrations')
        .insert([{ name: file }])

      if (recordError) {
        console.error(`Error recording migration ${file}:`, recordError)
        throw recordError
      }
    }

    // Wait a moment for PostgREST to refresh its schema cache
    console.log('Waiting for schema cache to refresh...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verify the schema cache is updated by making a test query
    const { error: testError } = await supabase
      .from('competitions')
      .select('description')
      .limit(1)

    if (testError) {
      console.error('Schema cache refresh verification failed:', testError)
      throw testError
    }

    console.log('✅ Migrations applied successfully!')
    } catch (error) {
    console.error('❌ Migration failed:', error)
      process.exit(1)
    }
  }

applyMigrations() 