import type { Database } from "../types/database"
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  try {
    // First create the competition
    const { data: competition, error: competitionError } = await supabase
      .from('competitions')
      .insert([{
        name: 'Nigeria Pro Club League',
        type: 'league',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      }])
      .select()
      .single()

    if (competitionError) throw competitionError
    console.log('Created competition:', competition)

    // Create teams without managers first
    const teams = [
      { name: 'Nameless Chaos', short_name: 'NCH' },
      { name: 'Menace FC', short_name: 'MFC' },
      { name: 'As Tornado', short_name: 'TOR' },
      { name: 'Get Clapped', short_name: 'GCF' },
      { name: 'Martial XI', short_name: 'MXI' },
      { name: 'Talker FC', short_name: 'TFC' },
      { name: 'Adventure Time', short_name: 'ADV' },
      { name: 'Effortless VFC', short_name: 'EFC' },
      { name: 'Phoenix VFC', short_name: 'PHX' },
      { name: 'Galaxy 11', short_name: 'GLX' },
      { name: 'Faceless Men XI', short_name: 'FMX' },
      { name: 'Curryz FC', short_name: 'CFC' }
    ]

    const { data: createdTeams, error: teamsError } = await supabase
      .from('teams')
      .insert(teams)
      .select()

    if (teamsError) throw teamsError
    console.log('Created teams:', createdTeams)

    console.log('Teams created successfully. Please assign managers to teams through the admin interface before adding them to competitions.')
    console.log('Teams cannot be added to competitions until they have managers assigned.')

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main() 
