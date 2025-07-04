'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, MessageSquare, Calendar, Trophy, Users, Settings, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface NotificationSettings {
  email: {
    matchReminders: boolean
    teamUpdates: boolean
    competitionResults: boolean
    transferOffers: boolean
    weeklyDigest: boolean
  }
  push: {
    matchReminders: boolean
    teamUpdates: boolean
    competitionResults: boolean
    transferOffers: boolean
    instantAlerts: boolean
  }
  sms: {
    matchReminders: boolean
    urgentUpdates: boolean
  }
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      matchReminders: true,
      teamUpdates: true,
      competitionResults: true,
      transferOffers: false,
      weeklyDigest: true
    },
    push: {
      matchReminders: true,
      teamUpdates: false,
      competitionResults: true,
      transferOffers: true,
      instantAlerts: true
    },
    sms: {
      matchReminders: false,
      urgentUpdates: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      // In a real app, you would fetch settings from the database
      // For now, we'll use the default settings
      setLoading(false)
    } catch (error) {
      console.error('Error loading notification settings:', error)
      setLoading(false)
    }
  }

  const updateSetting = (category: keyof NotificationSettings, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      // In a real app, you would save settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'matchReminders': return <Calendar className="w-4 h-4" />
      case 'teamUpdates': return <Users className="w-4 h-4" />
      case 'competitionResults': return <Trophy className="w-4 h-4" />
      case 'transferOffers': return <MessageSquare className="w-4 h-4" />
      case 'weeklyDigest': return <Mail className="w-4 h-4" />
      case 'instantAlerts': return <Bell className="w-4 h-4" />
      case 'urgentUpdates': return <Settings className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'matchReminders': return 'Match Reminders'
      case 'teamUpdates': return 'Team Updates'
      case 'competitionResults': return 'Competition Results'
      case 'transferOffers': return 'Transfer Offers'
      case 'weeklyDigest': return 'Weekly Digest'
      case 'instantAlerts': return 'Instant Alerts'
      case 'urgentUpdates': return 'Urgent Updates'
      default: return type
    }
  }

  const getNotificationDescription = (type: string) => {
    switch (type) {
      case 'matchReminders': return 'Get reminded about upcoming matches and events'
      case 'teamUpdates': return 'Receive updates about your team and squad changes'
      case 'competitionResults': return 'Get notified when competition results are available'
      case 'transferOffers': return 'Receive notifications about transfer offers and negotiations'
      case 'weeklyDigest': return 'Get a weekly summary of your team\'s performance'
      case 'instantAlerts': return 'Receive immediate notifications for important events'
      case 'urgentUpdates': return 'Get SMS alerts for critical updates and emergencies'
      default: return 'Notification setting'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-gray-600">Customize how you receive notifications and updates</p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Notifications</span>
              <Badge variant="outline">Primary</Badge>
            </CardTitle>
            <CardDescription>
              Manage your email notification preferences for important updates and summaries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.email).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {getNotificationIcon(key)}
                  <div>
                    <div className="font-medium">{getNotificationLabel(key)}</div>
                    <div className="text-sm text-gray-600">{getNotificationDescription(key)}</div>
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateSetting('email', key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Push Notifications</span>
              <Badge variant="outline">Mobile</Badge>
            </CardTitle>
            <CardDescription>
              Control push notifications on your mobile device for instant updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.push).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {getNotificationIcon(key)}
                  <div>
                    <div className="font-medium">{getNotificationLabel(key)}</div>
                    <div className="text-sm text-gray-600">{getNotificationDescription(key)}</div>
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateSetting('push', key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>SMS Notifications</span>
              <Badge variant="outline">Emergency</Badge>
            </CardTitle>
            <CardDescription>
              Receive SMS alerts for critical updates and emergency notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.sms).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {getNotificationIcon(key)}
                  <div>
                    <div className="font-medium">{getNotificationLabel(key)}</div>
                    <div className="text-sm text-gray-600">{getNotificationDescription(key)}</div>
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateSetting('sms', key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 