require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql) {
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: statement
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SQL execution failed: ${error}`);
      }
    }
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
}

async function ensureMigrationsTable() {
  console.log('Ensuring migrations table exists...');
  
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INTEGER NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create RLS policies
    ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;
    
    -- Allow authenticated users to read migrations
    DROP POLICY IF EXISTS "Allow authenticated users to read migrations" ON public.migrations;
    CREATE POLICY "Allow authenticated users to read migrations" 
      ON public.migrations FOR SELECT 
      TO authenticated 
      USING (true);
    
    -- Allow service role to manage migrations
    DROP POLICY IF EXISTS "Allow service role to manage migrations" ON public.migrations;
    CREATE POLICY "Allow service role to manage migrations" 
      ON public.migrations FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);
  `;

  try {
    await executeSql(createTableSql);
    console.log('✅ Migrations table is ready');
  } catch (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  }
}

async function getExecutedMigrations() {
  try {
    const { data, error } = await supabase
      .from('migrations')
      .select('name, batch')
      .order('executed_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    // If table doesn't exist yet, return empty array
    if (error.message.includes('relation "migrations" does not exist')) {
      return [];
    }
    throw error;
  }
}

async function executeMigration(filePath, batch) {
  const fileName = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Applying migration: ${fileName}`);
  
  try {
    // Execute the migration SQL
    await executeSql(sql);

    // Record the migration
    const { error: recordError } = await supabase
      .from('migrations')
      .insert([{
        name: fileName,
        batch: batch
      }]);

    if (recordError) {
      throw recordError;
    }

    console.log(`✅ Applied migration: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed to apply migration ${fileName}:`, error);
    throw error;
  }
}

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    const executedNames = new Set(executedMigrations.map(m => m.name));
    
    // Get current batch number
    const currentBatch = executedMigrations.length > 0
      ? Math.max(...executedMigrations.map(m => m.batch)) + 1
      : 1;

    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Apply pending migrations
    let appliedCount = 0;
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`Skipping already executed migration: ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      await executeMigration(filePath, currentBatch);
      appliedCount++;
    }

    if (appliedCount === 0) {
      console.log('No new migrations to apply');
    } else {
      console.log(`✅ Successfully applied ${appliedCount} migration${appliedCount === 1 ? '' : 's'}`);
    }

    // Verify schema cache is updated
    console.log('Verifying schema cache...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error: testError } = await supabase
      .from('migrations')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Schema cache verification failed:', testError);
      throw testError;
    }

    console.log('✅ Schema cache verified');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
migrate(); 