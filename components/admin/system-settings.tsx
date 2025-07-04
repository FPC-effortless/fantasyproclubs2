"use client"

import { useEffect, useState } from "react"
import {
  Settings,
  Save,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  Cloud,
  Server,
  Key,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface SystemSettings {
  emailSettings: {
    smtpHost: string
    smtpPort: string
    smtpUser: string
    smtpPassword: string
    senderEmail: string
    enableEmailNotifications: boolean
  }
  notificationSettings: {
    enablePushNotifications: boolean
    enableInAppNotifications: boolean
    matchReminders: boolean
    competitionUpdates: boolean
    teamUpdates: boolean
  }
  securitySettings: {
    minPasswordLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    maxLoginAttempts: number
    sessionTimeout: number
    enableTwoFactor: boolean
  }
  integrationSettings: {
    discordWebhook: string
    twitchApiKey: string
    enableDiscordIntegration: boolean
    enableTwitchIntegration: boolean
  }
  backupSettings: {
    enableAutoBackup: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    backupRetentionDays: number
    includeUserData: boolean
    includeMatchHistory: boolean
  }
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    emailSettings: {
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPassword: "",
      senderEmail: "",
      enableEmailNotifications: true,
    },
    notificationSettings: {
      enablePushNotifications: true,
      enableInAppNotifications: true,
      matchReminders: true,
      competitionUpdates: true,
      teamUpdates: true,
    },
    securitySettings: {
      minPasswordLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      enableTwoFactor: false,
    },
    integrationSettings: {
      discordWebhook: "",
      twitchApiKey: "",
      enableDiscordIntegration: false,
      enableTwitchIntegration: false,
    },
    backupSettings: {
      enableAutoBackup: true,
      backupFrequency: "daily",
      backupRetentionDays: 30,
      includeUserData: true,
      includeMatchHistory: true,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings")
        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }
        const data = await response.json()
        setSettings({
          emailSettings: data.email_settings,
          notificationSettings: data.notification_settings,
          securitySettings: data.security_settings,
          integrationSettings: data.integration_settings,
          backupSettings: data.backup_settings,
        })
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_settings: settings.emailSettings,
          notification_settings: settings.notificationSettings,
          security_settings: settings.securitySettings,
          integration_settings: settings.integrationSettings,
          backup_settings: settings.backupSettings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Success",
        description: "Settings saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email server settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.emailSettings.smtpHost}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpHost: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.emailSettings.smtpPort}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpPort: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.emailSettings.smtpUser}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpUser: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.emailSettings.smtpPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpPassword: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={settings.emailSettings.senderEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailSettings: { ...settings.emailSettings, senderEmail: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    checked={settings.emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        emailSettings: { ...settings.emailSettings, enableEmailNotifications: checked },
                      })
                    }
                  />
                  <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enablePushNotifications"
                    checked={settings.notificationSettings.enablePushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          enablePushNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableInAppNotifications"
                    checked={settings.notificationSettings.enableInAppNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          enableInAppNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="enableInAppNotifications">Enable In-App Notifications</Label>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="matchReminders"
                      checked={settings.notificationSettings.matchReminders}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            matchReminders: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="matchReminders">Match Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="competitionUpdates"
                      checked={settings.notificationSettings.competitionUpdates}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            competitionUpdates: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="competitionUpdates">Competition Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="teamUpdates"
                      checked={settings.notificationSettings.teamUpdates}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            teamUpdates: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="teamUpdates">Team Updates</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      min={6}
                      value={settings.securitySettings.minPasswordLength}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            minPasswordLength: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min={1}
                      value={settings.securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            maxLoginAttempts: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            requireSpecialChars: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={settings.securitySettings.requireNumbers}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            requireNumbers: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.securitySettings.enableTwoFactor}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            enableTwoFactor: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure third-party service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Discord Integration</h4>
                  <div className="space-y-2">
                    <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                    <Input
                      id="discordWebhook"
                      value={settings.integrationSettings.discordWebhook}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          integrationSettings: {
                            ...settings.integrationSettings,
                            discordWebhook: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableDiscordIntegration"
                      checked={settings.integrationSettings.enableDiscordIntegration}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          integrationSettings: {
                            ...settings.integrationSettings,
                            enableDiscordIntegration: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="enableDiscordIntegration">Enable Discord Integration</Label>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Twitch Integration</h4>
                  <div className="space-y-2">
                    <Label htmlFor="twitchApiKey">Twitch API Key</Label>
                    <Input
                      id="twitchApiKey"
                      type="password"
                      value={settings.integrationSettings.twitchApiKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          integrationSettings: {
                            ...settings.integrationSettings,
                            twitchApiKey: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTwitchIntegration"
                      checked={settings.integrationSettings.enableTwitchIntegration}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          integrationSettings: {
                            ...settings.integrationSettings,
                            enableTwitchIntegration: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="enableTwitchIntegration">Enable Twitch Integration</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>
                Configure automated backup settings and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAutoBackup"
                    checked={settings.backupSettings.enableAutoBackup}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        backupSettings: { ...settings.backupSettings, enableAutoBackup: checked },
                      })
                    }
                  />
                  <Label htmlFor="enableAutoBackup">Enable Automated Backups</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.backupSettings.backupFrequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setSettings({
                        ...settings,
                        backupSettings: { ...settings.backupSettings, backupFrequency: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetentionDays">Backup Retention (Days)</Label>
                  <Input
                    id="backupRetentionDays"
                    type="number"
                    min={1}
                    value={settings.backupSettings.backupRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        backupSettings: {
                          ...settings.backupSettings,
                          backupRetentionDays: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Content</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeUserData"
                      checked={settings.backupSettings.includeUserData}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          backupSettings: { ...settings.backupSettings, includeUserData: checked },
                        })
                      }
                    />
                    <Label htmlFor="includeUserData">Include User Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeMatchHistory"
                      checked={settings.backupSettings.includeMatchHistory}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          backupSettings: { ...settings.backupSettings, includeMatchHistory: checked },
                        })
                      }
                    />
                    <Label htmlFor="includeMatchHistory">Include Match History</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
