interface DebugUser {
  id: string
  email: string
  user_type: string
  is_admin: boolean
  session_valid: boolean
}

interface DebugDataResult {
  name: string
  count: number
  success: boolean
  error?: any
  data?: any
}

export class AdminDebugger {
  private component: string
  private supabase: any
  private session: any

  constructor(component: string, supabase: any, session: any) {
    this.component = component
    this.supabase = supabase
    this.session = session
  }

  async debugAuthentication(): Promise<DebugUser> {
    console.log(`🔧 [${this.component}] Session from provider:`, this.session ? 'Valid' : 'Invalid')
    
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    console.log(`🔍 [${this.component}] Current user:`, user?.id, user?.email)
    
    if (userError) {
      console.error(`❌ [${this.component}] Auth error:`, userError)
      return {
        id: '',
        email: '',
        user_type: '',
        is_admin: false,
        session_valid: false
      }
    }

    if (!user) {
      console.warn(`⚠️ [${this.component}] No authenticated user`)
      return {
        id: '',
        email: '',
        user_type: '',
        is_admin: false,
        session_valid: false
      }
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(`❌ [${this.component}] Profile error:`, profileError)
    }

    const debugUser: DebugUser = {
      id: user.id,
      email: user.email || '',
      user_type: profile?.user_type || 'unknown',
      is_admin: profile?.user_type === 'admin',
      session_valid: !!this.session
    }

    console.log(`👤 [${this.component}] User debug:`, {
      type: debugUser.user_type,
      is_admin: debugUser.is_admin,
      session_valid: debugUser.session_valid
    })

    return debugUser
  }

  async debugDataLoad(
    name: string, 
    queryPromise: Promise<any>,
    expectedFields?: string[]
  ): Promise<DebugDataResult> {
    console.log(`📊 [${this.component}] Loading ${name}...`)
    
    try {
      const result = await queryPromise
      
      if (result.error) {
        console.error(`❌ [${this.component}] ${name} error:`, result.error)
        return {
          name,
          count: 0,
          success: false,
          error: result.error
        }
      }

      const count = result.count !== undefined ? result.count : result.data?.length || 0
      console.log(`✅ [${this.component}] ${name} loaded: ${count} items`)
      
      // Debug first item if expectedFields provided
      if (expectedFields && result.data?.length > 0) {
        const firstItem = result.data[0]
        const fieldCheck = expectedFields.reduce((acc, field) => {
          acc[field] = firstItem[field] !== undefined ? '✓' : '✗'
          return acc
        }, {} as Record<string, string>)
        console.log(`🔍 [${this.component}] ${name} fields:`, fieldCheck)
      }

      return {
        name,
        count,
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error(`💥 [${this.component}] ${name} exception:`, error)
      return {
        name,
        count: 0,
        success: false,
        error
      }
    }
  }

  logComponentStart() {
    console.log(`🚀 [${this.component}] Component initializing...`)
  }

  logComponentFinish(results: DebugDataResult[]) {
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    const totalItems = results.reduce((sum, r) => sum + r.count, 0)
    
    console.log(`🎯 [${this.component}] Loading complete: ${successCount}/${totalCount} successful, ${totalItems} total items`)
  }

  logError(operation: string, error: any) {
    console.error(`💥 [${this.component}] ${operation} failed:`, error)
  }

  logSuccess(operation: string, details?: any) {
    console.log(`✅ [${this.component}] ${operation} successful`, details ? `:` : '', details)
  }
} 