"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Gamepad2, Shield, Users, Upload, CheckCircle2, XCircle } from "lucide-react"
import { validateAndFormatGamingTag, checkDuplicateGamingTags } from "@/lib/utils/gaming-validation"

interface GamingSettings {
  xbox_gamertag?: string
  psn_id?: string
  preferred_platform: "xbox" | "playstation" | "both"
  experience_level: "beginner" | "intermediate" | "advanced" | "professional"
  privacy: {
    show_gaming_tags: boolean
    show_platform: boolean
    allow_team_invites: boolean
  }
  verification: {
    xbox_verified: boolean
    psn_verified: boolean
    verification_history: Array<{
      platform: "xbox" | "playstation"
      status: "pending" | "verified" | "rejected"
      date: string
      reason?: string
    }>
  }
}

export function GamingSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<GamingSettings>({
    preferred_platform: "xbox",
    experience_level: "beginner",
    privacy: {
      show_gaming_tags: true,
      show_platform: true,
      allow_team_invites: true
    },
    verification: {
      xbox_verified: false,
      psn_verified: false,
      verification_history: []
    }
  })
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadGamingSettings()
  }, [])

  const loadGamingSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setSettings(prev => ({
        ...prev,
        xbox_gamertag: data.xbox_gamertag,
        psn_id: data.psn_id,
        preferred_platform: data.preferred_platform || "xbox",
        experience_level: data.experience_level || "beginner",
        privacy: {
          show_gaming_tags: data.show_gaming_tags ?? true,
          show_platform: data.show_platform ?? true,
          allow_team_invites: data.allow_team_invites ?? true
        },
        verification: {
          xbox_verified: data.xbox_verified ?? false,
          psn_verified: data.psn_verified ?? false,
          verification_history: data.verification_history || []
        }
      }))
    } catch (error) {
      console.error('Error loading gaming settings:', error)
      toast({
        title: "Error",
        description: "Failed to load gaming settings",
        variant: "destructive"
      })
    }
  }

  const handleGamingTagUpdate = async (platform: "xbox" | "playstation", value: string) => {
    try {
      setIsLoading(true)
      const validation = validateAndFormatGamingTag(value, platform)
      
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0],
          variant: "destructive"
        })
        return
      }

      const duplicateCheck = await checkDuplicateGamingTags(value, platform)
      if (duplicateCheck.data?.isDuplicate) {
        toast({
          title: "Duplicate Tag",
          description: `This ${platform} tag is already in use by ${duplicateCheck.data.existingUser?.username}`,
          variant: "destructive"
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('users')
        .update({
          [platform === 'xbox' ? 'xbox_gamertag' : 'psn_id']: validation.formattedTag
        })
        .eq('id', user.id)

      if (error) throw error

      setSettings(prev => ({
        ...prev,
        [platform === 'xbox' ? 'xbox_gamertag' : 'psn_id']: validation.formattedTag
      }))

      toast({
        title: "Success",
        description: `${platform === 'xbox' ? 'Xbox Gamertag' : 'PSN ID'} updated successfully`
      })
    } catch (error) {
      console.error('Error updating gaming tag:', error)
      toast({
        title: "Error",
        description: "Failed to update gaming tag",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyUpdate = async (key: keyof GamingSettings['privacy'], value: boolean) => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('users')
        .update({
          [key]: value
        })
        .eq('id', user.id)

      if (error) throw error

      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [key]: value
        }
      }))

      toast({
        title: "Success",
        description: "Privacy settings updated successfully"
      })
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Gaming Settings
        </CardTitle>
        <CardDescription>
          Manage your gaming platforms and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gaming Tags Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">Gaming Tags</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xbox">Xbox Gamertag</Label>
              <div className="flex gap-2">
                <Input
                  id="xbox"
                  placeholder="Enter Xbox Gamertag"
                  value={settings.xbox_gamertag || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, xbox_gamertag: e.target.value }))}
                />
                <Button 
                  variant="outline"
                  onClick={() => settings.xbox_gamertag && handleGamingTagUpdate("xbox", settings.xbox_gamertag)}
                  disabled={isLoading}
                >
                  Save
                </Button>
              </div>
              {settings.verification.xbox_verified && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="psn">PlayStation Network ID</Label>
              <div className="flex gap-2">
                <Input
                  id="psn"
                  placeholder="Enter PSN ID"
                  value={settings.psn_id || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, psn_id: e.target.value }))}
                />
                <Button 
                  variant="outline"
                  onClick={() => settings.psn_id && handleGamingTagUpdate("playstation", settings.psn_id)}
                  disabled={isLoading}
                >
                  Save
                </Button>
              </div>
              {settings.verification.psn_verified && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Platform Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold">Platform Preferences</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Preferred Platform</Label>
              <Select 
                value={settings.preferred_platform}
                onValueChange={(value: "xbox" | "playstation" | "both") => 
                  setSettings(prev => ({ ...prev, preferred_platform: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xbox">Xbox</SelectItem>
                  <SelectItem value="playstation">PlayStation</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select 
                value={settings.experience_level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced" | "professional") => 
                  setSettings(prev => ({ ...prev, experience_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Gaming Tags</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your gaming tags
                </p>
              </div>
              <Switch
                checked={settings.privacy.show_gaming_tags}
                onCheckedChange={(checked) => handlePrivacyUpdate("show_gaming_tags", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Platform</Label>
                <p className="text-sm text-muted-foreground">
                  Display your preferred gaming platform
                </p>
              </div>
              <Switch
                checked={settings.privacy.show_platform}
                onCheckedChange={(checked) => handlePrivacyUpdate("show_platform", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Team Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Receive invites from other teams
                </p>
              </div>
              <Switch
                checked={settings.privacy.allow_team_invites}
                onCheckedChange={(checked) => handlePrivacyUpdate("allow_team_invites", checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
