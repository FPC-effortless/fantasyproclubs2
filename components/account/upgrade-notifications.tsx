"use client"

import { useEffect, useState } from "react"
import { Bell, Mail, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Database } from "@/types/database"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface NotificationPreferences {
  email: boolean
  push: boolean
  statusChanges: boolean
  reviewUpdates: boolean
  estimatedTimeUpdates: boolean
}

export function UpgradeNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    statusChanges: true,
    reviewUpdates: true,
    estimatedTimeUpdates: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time updates for upgrade requests
    const channel = supabase
      .channel('upgrade_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_upgrade_requests',
        },
        (payload) => {
          handleUpgradeUpdate(payload)
        }
      )
      .subscribe()

    // Load user's notification preferences
    loadPreferences()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      })
    }
  }

  const updatePreferences = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newPreferences = { ...preferences, [key]: value }
      setPreferences(newPreferences)

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
      // Revert the change if it failed
      setPreferences(preferences)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeUpdate = (payload: any) => {
    const { eventType, new: newData, old: oldData } = payload

    // Only show notifications if the user has enabled them
    if (!preferences.statusChanges) return

    switch (eventType) {
      case 'INSERT':
        toast({
          title: "New Upgrade Request",
          description: "Your account upgrade request has been submitted",
        })
        break
      case 'UPDATE':
        if (newData.status !== oldData.status) {
          toast({
            title: "Status Update",
            description: `Your upgrade request has been ${newData.status}`,
            variant: newData.status === 'rejected' ? 'destructive' : 'default',
          })
        }
        break
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-accent" />
          <span>Upgrade Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) => updatePreferences('email', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser notifications</p>
            </div>
            <Switch
              checked={preferences.push}
              onCheckedChange={(checked) => updatePreferences('push', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Notification Types</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status Changes</Label>
              <p className="text-sm text-muted-foreground">When your request status changes</p>
            </div>
            <Switch
              checked={preferences.statusChanges}
              onCheckedChange={(checked) => updatePreferences('statusChanges', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Review Updates</Label>
              <p className="text-sm text-muted-foreground">When your request is reviewed</p>
            </div>
            <Switch
              checked={preferences.reviewUpdates}
              onCheckedChange={(checked) => updatePreferences('reviewUpdates', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Time Estimates</Label>
              <p className="text-sm text-muted-foreground">Updates about review time estimates</p>
            </div>
            <Switch
              checked={preferences.estimatedTimeUpdates}
              onCheckedChange={(checked) => updatePreferences('estimatedTimeUpdates', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
