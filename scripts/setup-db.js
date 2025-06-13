#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
const { createClient } = require('@supabase/supabase-js')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
    return envVars
  }
  return null
}

async function main() {
  console.log('🚀 Setting up the database...\n')

  // Check if supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' })
  } catch (error) {
    console.error('❌ Supabase CLI is not installed. Please install it first:')
    console.log('npm install -g supabase')
    process.exit(1)
  }

  // Try to read existing credentials from .env.local
  const existingEnv = await readEnvFile()
  let projectUrl = existingEnv?.NEXT_PUBLIC_SUPABASE_URL
  let anonKey = existingEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only prompt for credentials if they're not found in .env.local
  if (!projectUrl || !anonKey) {
    console.log('Please enter your Supabase credentials:')
    projectUrl = await question('Project URL: ')
    anonKey = await question('Anon Key: ')
    
    // Create .env.local with the new credentials
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`

    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Created .env.local with Supabase credentials')
  } else {
    console.log('✅ Using existing Supabase credentials from .env.local')
  }

  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true })
    console.log('✅ Created migrations directory')
  }

  // Run migrations
  try {
    console.log('\n📦 Running migrations...')
    execSync('supabase db reset', { stdio: 'inherit' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Error running migrations:', error.message)
    process.exit(1)
  }

  console.log('\n🎉 Database setup completed!')
  console.log('\nNext steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Open http://localhost:3000 in your browser')
  
  rl.close()
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
)

async function setupDatabase() {
  try {
    console.log('Setting up database tables...')

    // Create competitions table
    console.log('Creating competitions table...')
    const { error: competitionsError } = await supabase
      .from('competitions')
      .select('id')
      .limit(1)
      .single()

    if (competitionsError && competitionsError.code === 'PGRST116') {
      const { error } = await supabase
        .from('competitions')
        .insert([
          {
            name: 'Example Competition',
            description: 'This is an example competition'
          }
        ])
        .select()
      if (error) throw error
      console.log('✅ Competitions table created')
    }

    // Create trophies table
    console.log('Creating trophies table...')
    const { error: trophiesError } = await supabase
      .from('trophies')
      .select('id')
      .limit(1)
      .single()

    if (trophiesError && trophiesError.code === 'PGRST116') {
      const { error } = await supabase
        .from('trophies')
        .insert([
          {
            name: 'Example Trophy',
            description: 'This is an example trophy',
            type: 'team'
          }
        ])
        .select()
      if (error) throw error
      console.log('✅ Trophies table created')
    }

    // Create trophy_recipients table
    console.log('Creating trophy_recipients table...')
    const { error: recipientsError } = await supabase
      .from('trophy_recipients')
      .select('id')
      .limit(1)
      .single()

    if (recipientsError && recipientsError.code === 'PGRST116') {
      const { error } = await supabase
        .from('trophy_recipients')
        .insert([
          {
            trophy_id: null,
            recipient_id: '00000000-0000-0000-0000-000000000000',
            recipient_type: 'team'
          }
        ])
        .select()
      if (error && error.code !== '23503') {
        console.log('✅ Trophy recipients table created')
      }
    }

    console.log('✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
setupDatabase() 