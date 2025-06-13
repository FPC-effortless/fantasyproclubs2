import { ApiRequestConfig, ApiResponse } from "@/lib/types/api"
import { handleError } from "@/lib/errors"
import { toast } from "@/components/ui/use-toast"

export interface Interceptor {
  request?: (config: ApiRequestConfig) => Promise<ApiRequestConfig> | ApiRequestConfig
  response?: (response: ApiResponse<unknown>) => Promise<ApiResponse<unknown>> | ApiResponse<unknown>
  error?: (error: unknown) => Promise<ApiResponse<unknown>> | ApiResponse<unknown>
}

class InterceptorManager {
  private interceptors: Interceptor[] = []

  use(interceptor: Interceptor) {
    this.interceptors.push(interceptor)
    return () => {
      const index = this.interceptors.indexOf(interceptor)
      if (index > -1) {
        this.interceptors.splice(index, 1)
      }
    }
  }

  async applyRequestInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
    let finalConfig = { ...config }
    
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        finalConfig = await interceptor.request(finalConfig)
      }
    }
    
    return finalConfig
  }

  async applyResponseInterceptors(response: ApiResponse<unknown>): Promise<ApiResponse<unknown>> {
    let finalResponse = { ...response }
    
    for (const interceptor of this.interceptors) {
      if (interceptor.response) {
        finalResponse = await interceptor.response(finalResponse)
      }
    }
    
    return finalResponse
  }

  async applyErrorInterceptors(error: unknown): Promise<ApiResponse<unknown>> {
    let finalError = error
    
    for (const interceptor of this.interceptors) {
      if (interceptor.error) {
        finalError = await interceptor.error(finalError)
      }
    }
    
    return finalError as ApiResponse<unknown>
  }
}

// Create default interceptors
const defaultInterceptors: Interceptor[] = [
  {
    request: async (config) => {
      // Add timestamp to prevent caching
      const params = { ...config.params, _t: Date.now() }
      return { ...config, params }
    },
    response: async (response) => {
      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive"
        })
      }
      return response
    },
    error: async (error) => {
      const appError = handleError(error)
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive"
      })
      return {
        data: null,
        error: {
          code: appError.code,
          message: appError.message
        }
      }
    }
  }
]

// Create and export the interceptor manager instance
export const interceptorManager = new InterceptorManager()

// Register default interceptors
defaultInterceptors.forEach(interceptor => interceptorManager.use(interceptor)) 
