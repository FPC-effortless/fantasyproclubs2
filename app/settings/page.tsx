"use client"

import { useAuth } from "@/lib/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Phone, Calendar, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  phone_number: string | null
  date_of_birth: string | null
  user_type: string
  xbox_gamertag: string | null
  psn_id: string | null
  preferred_platform: string | null
}

export default function SettingsPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    phoneNumber: "",
    dateOfBirth: "",
    xboxGamertag: "",
    psnId: "",
    preferredPlatform: "",
  })

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user?.id)
          .single()

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
          throw error
        }

        if (data) {
          setProfile(data)
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            displayName: data.display_name || "",
            phoneNumber: data.phone_number || "",
            dateOfBirth: data.date_of_birth || "",
            xboxGamertag: data.xbox_gamertag || "",
            psnId: data.psn_id || "",
            preferredPlatform: data.preferred_platform || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [session, user, router, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session) {
      router.push("/login")
      return
    }

    setSaving(true)

    try {
      const updateData = {
        id: user.id,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        display_name: formData.displayName || null,
        phone_number: formData.phoneNumber || null,
        date_of_birth: formData.dateOfBirth || null,
        xbox_gamertag: formData.xboxGamertag || null,
        psn_id: formData.psnId || null,
        preferred_platform: formData.preferredPlatform || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("user_profiles")
        .upsert(updateData)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#00ff87]" />
          <span className="text-white">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and gaming preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-[#00ff87] flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-[#2a2a2a] border-[#444444] text-white"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-[#2a2a2a] border-[#444444] text-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="How others will see you"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="pl-10 bg-[#2a2a2a] border-[#444444] text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="pl-10 bg-[#2a2a2a] border-[#444444] text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gaming Information */}
        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-[#00ff87] flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Gaming Information
            </CardTitle>
            <CardDescription>
              Connect your gaming accounts and set preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xboxGamertag" className="text-white">Xbox Gamertag</Label>
              <Input
                id="xboxGamertag"
                name="xboxGamertag"
                value={formData.xboxGamertag}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="Your Xbox gamertag"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psnId" className="text-white">PlayStation ID</Label>
              <Input
                id="psnId"
                name="psnId"
                value={formData.psnId}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="Your PSN ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredPlatform" className="text-white">Preferred Platform</Label>
              <select
                id="preferredPlatform"
                name="preferredPlatform"
                value={formData.preferredPlatform}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md"
                aria-label="Select your preferred gaming platform"
                title="Choose your preferred gaming platform"
              >
                <option value="">Select platform</option>
                <option value="xbox">Xbox</option>
                <option value="playstation">PlayStation</option>
                <option value="both">Both</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-[#00ff87] flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              View your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Email Address</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-[#2a2a2a] border-[#444444] text-gray-400"
              />
              <p className="text-sm text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Account Type</Label>
              <Input
                value={profile?.user_type || "fan"}
                disabled
                className="bg-[#2a2a2a] border-[#444444] text-gray-400 capitalize"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 border-[#333333] text-white hover:bg-[#333333]"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#00ff87] text-black hover:bg-[#00cc6a] font-semibold"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 
