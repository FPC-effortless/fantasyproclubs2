import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rnihbbrrqnvfruqaglmm.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWhiYnJycW52ZnJ1cWFnbG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODY0NDMsImV4cCI6MjA2Mzk2MjQ0M30.LGv42_HVEHrsdOrGngMsvfH3zH6qMNdF_W-tgbt9zMo"

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Singleton client instance for browser
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return clientInstance
}

// Export the singleton instance as default
export const supabase = getSupabaseClient()

// Server-side client for use in Server Components and API routes
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWhiYnJycW52ZnJ1cWFnbG1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM4NjQ0MywiZXhwIjoyMDYzOTYyNDQzfQ.SASLUnS07wyKu2VzaVP7_tnKLoLT2Q1XeA_t9tZ7WkU"
  
  if (!serviceRoleKey) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY")
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey)
}
