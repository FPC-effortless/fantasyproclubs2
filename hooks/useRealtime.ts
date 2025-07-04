import { useEffect, useState } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from "@/lib/supabase/client"

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface RealtimeSubscription {
  table: string
  event: RealtimeEvent
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
}

export function useRealtime() {
  const [channels, setChannels] = useState<RealtimeChannel[]>([])
  const supabase = createClient()

  const subscribe = (subscription: RealtimeSubscription) => {
    const channel = supabase
      .channel(`${subscription.table}_changes`)
      .on(
        'postgres_changes' as any,
        {
          event: subscription.event,
          schema: 'public',
          table: subscription.table,
        },
        subscription.callback
      )
      .subscribe()

    setChannels((prev) => [...prev, channel])
    return channel
  }

  const unsubscribe = (channel: RealtimeChannel) => {
    channel.unsubscribe()
    setChannels((prev) => prev.filter((ch) => ch !== channel))
  }

  const unsubscribeAll = () => {
    channels.forEach((channel) => channel.unsubscribe())
    setChannels([])
  }

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [])

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
  }
} 
