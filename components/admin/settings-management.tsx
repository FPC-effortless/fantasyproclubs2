"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Mail,
  Bell,
  Lock,
  Link2,
  Database,
  Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface SystemSettings {
  id: number
  email_settings: {
    smtpHost: string
    smtpPort: string
    smtpUser: string
    smtpPassword: string
    senderEmail: string
    enableEmailNotifications: boolean
  }
  notification_settings: {
    enablePushNotifications: boolean
    enableInAppNotifications: boolean
    matchReminders: boolean
    competitionUpdates: boolean
    teamUpdates: boolean
  }
  security_settings: {
    minPasswordLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    maxLoginAttempts: number
    sessionTimeout: number
    enableTwoFactor: boolean
  }
  integration_settings: {
    discordWebhook: string
    twitchApiKey: string
    enableDiscordIntegration: boolean
    enableTwitchIntegration: boolean
  }
  backup_settings: {
    enableAutoBackup: boolean
    backupFrequency: string
    backupRetentionDays: number
    includeUserData: boolean
    includeMatchHistory: boolean
  }
}

const defaultSettings: Omit<SystemSettings, 'id'> = {
  email_settings: {
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    senderEmail: "",
    enableEmailNotifications: false
  },
  notification_settings: {
    enablePushNotifications: false,
    enableInAppNotifications: true,
    matchReminders: true,
    competitionUpdates: true,
    teamUpdates: true
  },
  security_settings: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    enableTwoFactor: false
  },
  integration_settings: {
    discordWebhook: "",
    twitchApiKey: "",
    enableDiscordIntegration: false,
    enableTwitchIntegration: false
  },
  backup_settings: {
    enableAutoBackup: true,
    backupFrequency: "daily",
    backupRetentionDays: 30,
    includeUserData: true,
    includeMatchHistory: true
  }
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings')
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error data from API:', errorData)
        console.error('Response status code:', response.status);
        throw new Error(errorData.error || 'Failed to fetch settings')
      }

      const data = await response.json()
      setSettings({ id: 1, ...data })
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_settings: settings.email_settings,
          notification_settings: settings.notification_settings,
          security_settings: settings.security_settings,
          integration_settings: settings.integration_settings,
          backup_settings: settings.backup_settings,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !settings) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide settings for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings.email_settings.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtpHost: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={settings.email_settings.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtpPort: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP User</Label>
                  <Input
                    value={settings.email_settings.smtpUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtpUser: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={settings.email_settings.smtpPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtpPassword: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input
                    value={settings.email_settings.senderEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        senderEmail: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.email_settings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        enableEmailNotifications: checked
                      }
                    })}
                  />
                  <Label>Enable Email Notifications</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notification_settings.enablePushNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_settings: {
                        ...settings.notification_settings,
                        enablePushNotifications: checked
                      }
                    })}
                  />
                  <Label>Enable Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notification_settings.enableInAppNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_settings: {
                        ...settings.notification_settings,
                        enableInAppNotifications: checked
                      }
                    })}
                  />
                  <Label>Enable In-App Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notification_settings.matchReminders}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_settings: {
                        ...settings.notification_settings,
                        matchReminders: checked
                      }
                    })}
                  />
                  <Label>Match Reminders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notification_settings.competitionUpdates}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_settings: {
                        ...settings.notification_settings,
                        competitionUpdates: checked
                      }
                    })}
                  />
                  <Label>Competition Updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notification_settings.teamUpdates}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_settings: {
                        ...settings.notification_settings,
                        teamUpdates: checked
                      }
                    })}
                  />
                  <Label>Team Updates</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={settings.security_settings.minPasswordLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        minPasswordLength: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.security_settings.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        requireSpecialChars: checked
                      }
                    })}
                  />
                  <Label>Require Special Characters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.security_settings.requireNumbers}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        requireNumbers: checked
                      }
                    })}
                  />
                  <Label>Require Numbers</Label>
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.security_settings.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        maxLoginAttempts: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.security_settings.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.security_settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security_settings: {
                        ...settings.security_settings,
                        enableTwoFactor: checked
                      }
                    })}
                  />
                  <Label>Enable Two-Factor Authentication</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Discord Webhook URL</Label>
                  <Input
                    value={settings.integration_settings.discordWebhook}
                    onChange={(e) => setSettings({
                      ...settings,
                      integration_settings: {
                        ...settings.integration_settings,
                        discordWebhook: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitch API Key</Label>
                  <Input
                    value={settings.integration_settings.twitchApiKey}
                    onChange={(e) => setSettings({
                      ...settings,
                      integration_settings: {
                        ...settings.integration_settings,
                        twitchApiKey: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.integration_settings.enableDiscordIntegration}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integration_settings: {
                        ...settings.integration_settings,
                        enableDiscordIntegration: checked
                      }
                    })}
                  />
                  <Label>Enable Discord Integration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.integration_settings.enableTwitchIntegration}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integration_settings: {
                        ...settings.integration_settings,
                        enableTwitchIntegration: checked
                      }
                    })}
                  />
                  <Label>Enable Twitch Integration</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.backup_settings.enableAutoBackup}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backup_settings: {
                        ...settings.backup_settings,
                        enableAutoBackup: checked
                      }
                    })}
                  />
                  <Label>Enable Automatic Backup</Label>
                </div>
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Input
                    value={settings.backup_settings.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      backup_settings: {
                        ...settings.backup_settings,
                        backupFrequency: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup Retention Days</Label>
                  <Input
                    type="number"
                    value={settings.backup_settings.backupRetentionDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      backup_settings: {
                        ...settings.backup_settings,
                        backupRetentionDays: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.backup_settings.includeUserData}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backup_settings: {
                        ...settings.backup_settings,
                        includeUserData: checked
                      }
                    })}
                  />
                  <Label>Include User Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.backup_settings.includeMatchHistory}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backup_settings: {
                        ...settings.backup_settings,
                        includeMatchHistory: checked
                      }
                    })}
                  />
                  <Label>Include Match History</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
