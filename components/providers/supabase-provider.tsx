"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type SupabaseClient } from "@supabase/supabase-js"
import { type Session } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"
import type { Database } from "@/types/database"
import { getSupabaseClient } from "@/lib/supabase"

type SupabaseContext = {
  supabase: SupabaseClient
  session: Session | null
  isLoading: boolean
  error: Error | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Use the singleton client
  const [supabase] = useState(() => getSupabaseClient())
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Test the connection first with retry logic for network issues
        let retryCount = 0
        const maxRetries = 3
        let testError: any = null
        
        while (retryCount < maxRetries) {
          try {
            const { data: testData, error } = await supabase
              .from('user_profiles')
              .select('id')
              .limit(1)
            
            if (!error) {
              testError = null
              break
            }
            
            testError = error
            
            // Check if it's a network connectivity issue
            if (error.message?.includes('Failed to fetch') || 
                error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
                error.message?.includes('TypeError: Failed to fetch')) {
              retryCount++
              if (retryCount < maxRetries) {
                console.log(`Network error detected, retrying... (${retryCount}/${maxRetries})`)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
                continue
              }
            }
            
            break
          } catch (networkError: any) {
            testError = networkError
            if (networkError.message?.includes('Failed to fetch') || 
                networkError.message?.includes('ERR_INTERNET_DISCONNECTED')) {
              retryCount++
              if (retryCount < maxRetries) {
                console.log(`Network error detected, retrying... (${retryCount}/${maxRetries})`)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                continue
              }
            }
            break
          }
        }
        
        if (testError) {
          // Log the full error object for debugging
          console.error('Full Supabase test error:', testError)
          
          // Check for network connectivity issues
          if (testError.message?.includes('Failed to fetch') || 
              testError.message?.includes('ERR_INTERNET_DISCONNECTED')) {
            throw new Error('Network connectivity issue. Please check your internet connection and try again.')
          }
          
          // Extract status code from error response if available
          const statusCode = testError.code || (testError as any)?.status || 'unknown'
          const errorMessage = testError.message || 'Unknown error occurred'
          
          throw new Error(`Database connection error (${statusCode}): ${errorMessage}`)
        }

        // If connection is good, get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Full Supabase session error:', sessionError)
          throw new Error(`Authentication error: ${sessionError.message}`)
        }

        setSession(session)
      } catch (error: any) {
        console.error('Caught error:', error)
        setError(error)
        
        // Show different messages for different error types
        let title = "Connection Error"
        let description = error.message || "Failed to connect to the service. Please try again."
        
        if (error.message?.includes('Network connectivity issue')) {
          title = "Network Error"
          description = "Unable to connect to the internet. Please check your connection and try again."
        }
        
        toast({
          title,
          description,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff87]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-[#111111] rounded-lg text-center">
          <h2 className="text-xl font-bold text-[#00ff87] mb-4">Connection Error</h2>
          <p className="text-white mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00ff87] text-black rounded hover:bg-[#00cc6a] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Context.Provider value={{ supabase, session, isLoading, error }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
} 
