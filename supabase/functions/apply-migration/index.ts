import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sql } = await req.json()

    if (!sql) {
      throw new Error('SQL query is required')
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Execute the SQL using the pg connection
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: sql
    }).single()

    if (error) {
      // If exec_sql function doesn't exist, create it
      if (error.message.includes('function exec_sql() does not exist')) {
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          SET search_path = public
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
          
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
        `

        const { error: createError } = await supabaseAdmin
          .from('_sqlexec')
          .select('*')
          .eq('query', createFunctionSql)
          .single()

        if (createError) {
          throw createError
        }

        // Try the original query again
        const { error: retryError } = await supabaseAdmin.rpc('exec_sql', {
          sql_query: sql
        }).single()

        if (retryError) {
          throw retryError
        }
      } else {
        throw error
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 
