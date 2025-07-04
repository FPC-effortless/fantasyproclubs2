import { handleError, withErrorHandling } from '@/lib/error-handler'
import { createClient } from "@/lib/supabase/client"

export class SecureDatabaseClient {
  private supabase = createClient()

  constructor() {
    // Log security event when client is created
    this.logSecurityEvent('DATABASE_CLIENT_CREATED', 'CLIENT', null, {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    })
  }

  // Secure query builder that prevents SQL injection
  async secureQuery<T>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    params: {
      select?: string
      filters?: Record<string, any>
      data?: Record<string, any>
      single?: boolean
    } = {}
  ): Promise<T> {
    return withErrorHandling(async () => {
      let query = this.supabase.from(table)

      switch (operation) {
        case 'select':
          if (params.select) {
            query = query.select(params.select)
          } else {
            query = query.select('*')
          }
          break
        case 'insert':
          if (!params.data) {
            throw new Error('Data is required for insert operation')
          }
          query = query.insert(params.data)
          break
        case 'update':
          if (!params.data) {
            throw new Error('Data is required for update operation')
          }
          query = query.update(params.data)
          break
        case 'delete':
          query = query.delete()
          break
      }

      // Apply filters securely using Supabase's built-in parameterization
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Validate column name to prevent injection
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              throw new Error(`Invalid column name: ${key}`)
            }
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = params.single 
        ? await query.single()
        : await query

      if (error) {
        await this.logSecurityEvent('DATABASE_ERROR', table.toUpperCase(), null, {
          operation,
          error: error.message,
          code: error.code
        }, false, error.message)
        throw error
      }

      await this.logSecurityEvent('DATABASE_OPERATION', table.toUpperCase(), null, {
        operation,
        success: true
      })

      return data as T
    }, { operation: `${operation}_${table}`, resource: table })
  }

  // Secure user profile operations
  async getUserProfile(userId: string) {
    return this.secureQuery('user_profiles', 'select', {
      filters: { id: userId },
      single: true
    })
  }

  async updateUserProfile(userId: string, data: Partial<any>) {
    // Validate user can only update their own profile
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized: Can only update own profile')
    }

    return this.secureQuery('user_profiles', 'update', {
      data,
      filters: { id: userId }
    })
  }

  // Secure team operations
  async getTeam(teamId: string) {
    return this.secureQuery('teams', 'select', {
      filters: { id: teamId },
      single: true
    })
  }

  async getTeamsByManager(managerId: string) {
    return this.secureQuery('teams', 'select', {
      filters: { manager_id: managerId }
    })
  }

  async updateTeam(teamId: string, data: Partial<any>) {
    // Verify user is team manager or admin
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const team = await this.getTeam(teamId)
    if (team.manager_id !== user.id) {
      // Check if user is admin
      const profile = await this.getUserProfile(user.id)
      if (profile.user_type !== 'admin') {
        throw new Error('Unauthorized: Only team manager or admin can update team')
      }
    }

    return this.secureQuery('teams', 'update', {
      data,
      filters: { id: teamId }
    })
  }

  // Secure player operations
  async getTeamPlayers(teamId: string) {
    return this.secureQuery('players', 'select', {
      select: `
        *,
        user_profiles!inner(
          username,
          email,
          user_type
        )
      `,
      filters: { team_id: teamId }
    })
  }

  // Security audit logging
  private async logSecurityEvent(
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage: string | null = null
  ) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      await this.supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_details: details,
        p_success: success,
        p_error_message: errorMessage
      })
    } catch (error) {
      // Don't let audit logging failure break the main operation
      console.error('Failed to log security event:', error)
    }
  }

  // Validate input data to prevent injection
  private validateInput(data: any): void {
    if (typeof data === 'string') {
      // Check for potential SQL injection patterns
      const dangerousPatterns = [
        /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT|MERGE|SELECT|UPDATE|UNION( ALL){0,1})\b)/i,
        /(--|\*\/|\/\*)/,
        /(\b(AND|OR)\b.*(\=|\>|\<|\!|\<\>|\<\=|\>\=))/i,
        /(\b(WAITFOR|DELAY)\b)/i
      ]

      const containsDangerousPattern = dangerousPatterns.some(pattern => pattern.test(data))
      if (containsDangerousPattern) {
        throw new Error('Invalid input: Potential SQL injection detected')
      }
    }

    if (typeof data === 'object' && data !== null) {
      Object.values(data).forEach(value => {
        if (typeof value === 'string') {
          this.validateInput(value)
        }
      })
    }
  }

  // Rate limited operations
  async performLimitedOperation<T>(
    operation: () => Promise<T>,
    operationType: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): Promise<T> {
    const { data: { user } } = await this.supabase.auth.getUser()
    const identifier = user ? `user:${user.id}` : 'anonymous'

    // Check rate limit (this would integrate with your rate limiting system)
    // For now, we'll just log the operation
    await this.logSecurityEvent('RATE_LIMITED_OPERATION', operationType, null, {
      identifier,
      maxAttempts,
      windowMs
    })

    return operation()
  }

  // Cleanup method
  async cleanup() {
    await this.logSecurityEvent('DATABASE_CLIENT_CLEANUP', 'CLIENT', null, {
      timestamp: new Date().toISOString()
    })
  }
}

// Export singleton instance
export const secureDb = new SecureDatabaseClient()

// Type-safe database operations
export interface DatabaseOperations {
  getUserProfile(userId: string): Promise<any>
  updateUserProfile(userId: string, data: Partial<any>): Promise<any>
  getTeam(teamId: string): Promise<any>
  getTeamsByManager(managerId: string): Promise<any[]>
  updateTeam(teamId: string, data: Partial<any>): Promise<any>
  getTeamPlayers(teamId: string): Promise<any[]>
} 