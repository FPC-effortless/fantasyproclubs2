import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function handleSupabaseQuery<T>(
  supabase: SupabaseClient<Database>,
  queryFn: () => Promise<{
    data: T | null
    error: any
    count: number | null
  }>,
  errorMessage = 'Database operation failed'
) {
  try {
    const { data, error, count } = await queryFn()

    if (error) {
      console.error('Supabase query error:', {
        error,
        message: errorMessage
      })
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error: any) {
    console.error('Supabase operation error:', {
      error,
      message: errorMessage
    })
    throw new Error(error.message || errorMessage)
  }
}

export type QueryOptions = {
  page?: number
  limit?: number
  orderBy?: string
  ascending?: boolean
  filters?: Record<string, any>
  search?: {
    term: string
    fields: string[]
  }
}

export async function executeQuery<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  tableName: T,
  options: QueryOptions = {},
  select = '*'
): Promise<{
  data: Database['public']['Tables'][T]['Row'][] | null
  count: number | null
}> {
  const {
    page = 1,
    limit = 10,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
    search
  } = options

  let query = supabase.from(tableName).select(select, { count: 'exact' })

  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object') {
          if (value.operator === 'like') {
            query = query.ilike(key, `%${value.value}%`)
          } else if (value.operator === 'gt') {
            query = query.gt(key, value.value)
          } else if (value.operator === 'gte') {
            query = query.gte(key, value.value)
          } else if (value.operator === 'lt') {
            query = query.lt(key, value.value)
          } else if (value.operator === 'lte') {
            query = query.lte(key, value.value)
          } else if (value.operator === 'between') {
            query = query.gte(key, value.min).lte(key, value.max)
          }
        } else {
          query = query.eq(key, value)
        }
      }
    })
  }

  // Apply search if provided
  if (search) {
    const searchConditions = search.fields.map(field => 
      `${field}.ilike.%${search.term}%`
    )
    query = query.or(searchConditions.join(','))
  }

  // Apply pagination and ordering
  const offset = (page - 1) * limit
  query = query
    .range(offset, offset + limit - 1)
    .order(orderBy, { ascending })

  const { data, count } = await handleSupabaseQuery(
    supabase,
    async () => {
      const result = await query
      return {
        data: result.data,
        error: result.error,
        count: result.count || null
      }
    },
    `Failed to query ${tableName}`
  )

  return { 
    data: data as Database['public']['Tables'][T]['Row'][] | null,
    count 
  }
} 
