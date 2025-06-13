import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { checkRateLimit, apiRateLimiter } from './rate-limit'
import { ValidationError } from './errors'
import { sanitizeString } from './utils/sanitize'
import { Database } from '../types/database'
import { apiLogger, measureExecutionTime } from './logger'

// Create Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
)

// Helper function to sanitize request data
function sanitizeRequestData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeRequestData)
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, {
        trim: true,
        removeSpecialChars: true
      })
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any) {
  const code = error.code
  let message: string
  
  switch (code) {
    case '23505': // Unique violation
      message = 'Duplicate entry'
      break
    case '23503': // Foreign key violation
      message = 'Referenced record does not exist'
      break
    case '23502': // Not null violation
      message = 'Required field is missing'
      break
    case '22P02': // Invalid text representation
      message = 'Invalid data format'
      break
    case '42703': // Undefined column
      message = 'Invalid field name'
      break
    case '42P01': // Undefined table
      message = 'Resource not found'
      break
    case '42501': // Insufficient privilege
      message = 'Unauthorized'
      break
    default:
      message = error.message || 'An error occurred'
  }

  apiLogger.error(`Database error: ${message}`, { code, error }, 'database')
  throw new ValidationError(message)
}

// Helper function to get response count
function getResponseCount<T>(response: { data: T | null }): number {
  if (!response.data) return 0
  if (Array.isArray(response.data)) return response.data.length
  return 1
}

// Enhanced Supabase client with middleware
export const enhancedSupabase = {
  ...supabase,
  from: (table: string) => {
    const query = supabase.from(table)
    
    return {
      ...query,
      select: async (...args: Parameters<typeof query.select>) => {
        return measureExecutionTime(
          async () => {
            await checkRateLimit(apiRateLimiter, 'api', 'API rate limit exceeded')
            apiLogger.info(`Selecting from ${table}`, { args }, 'database')
            
            const response = await query.select(...args)
            
            if (response.error) {
              handleSupabaseError(response.error)
            }
            
            apiLogger.info(`Successfully selected from ${table}`, { count: getResponseCount(response) }, 'database')
            return response
          },
          apiLogger,
          `select:${table}`
        )
      },
      insert: async (...args: Parameters<typeof query.insert>) => {
        return measureExecutionTime(
          async () => {
            await checkRateLimit(apiRateLimiter, 'api', 'API rate limit exceeded')
            const [data] = args
            const sanitizedData = sanitizeRequestData(data)
            apiLogger.info(`Inserting into ${table}`, { data: sanitizedData }, 'database')
            
            const response = await query.insert(sanitizedData)
            
            if (response.error) {
              handleSupabaseError(response.error)
            }
            
            apiLogger.info(`Successfully inserted into ${table}`, { count: getResponseCount(response) }, 'database')
            return response
          },
          apiLogger,
          `insert:${table}`
        )
      },
      update: async (...args: Parameters<typeof query.update>) => {
        return measureExecutionTime(
          async () => {
            await checkRateLimit(apiRateLimiter, 'api', 'API rate limit exceeded')
            const [data] = args
            const sanitizedData = sanitizeRequestData(data)
            apiLogger.info(`Updating ${table}`, { data: sanitizedData }, 'database')
            
            const response = await query.update(sanitizedData)
            
            if (response.error) {
              handleSupabaseError(response.error)
            }
            
            apiLogger.info(`Successfully updated ${table}`, { count: getResponseCount(response) }, 'database')
            return response
          },
          apiLogger,
          `update:${table}`
        )
      },
      delete: async (...args: Parameters<typeof query.delete>) => {
        return measureExecutionTime(
          async () => {
            await checkRateLimit(apiRateLimiter, 'api', 'API rate limit exceeded')
            apiLogger.info(`Deleting from ${table}`, { args }, 'database')
            
            const response = await query.delete(...args)
            
            if (response.error) {
              handleSupabaseError(response.error)
            }
            
            apiLogger.info(`Successfully deleted from ${table}`, { count: getResponseCount(response) }, 'database')
            return response
          },
          apiLogger,
          `delete:${table}`
        )
      }
    }
  }
} 
