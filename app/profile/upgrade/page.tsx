"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function UpgradeRequestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    requested_role: "",
    xbox_gamertag: "",
    psn_id: "",
    preferred_platform: "",
    experience_level: "",
  })
  const router = useRouter()
  const supabase = createClient<Database>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('account_upgrade_requests')
        .insert({
          user_id: user.id,
          ...formData,
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your upgrade request has been submitted",
      })

      router.push('/profile')
    } catch (error) {
      console.error('Error submitting upgrade request:', error)
      toast({
        title: "Error",
        description: "Failed to submit upgrade request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Request Account Upgrade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requested_role">Requested Role</Label>
              <Select
                value={formData.requested_role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, requested_role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xbox_gamertag">Xbox Gamertag</Label>
              <Input
                id="xbox_gamertag"
                value={formData.xbox_gamertag}
                onChange={(e) => setFormData(prev => ({ ...prev, xbox_gamertag: e.target.value }))}
                placeholder="Enter your Xbox Gamertag"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psn_id">PlayStation Network ID</Label>
              <Input
                id="psn_id"
                value={formData.psn_id}
                onChange={(e) => setFormData(prev => ({ ...prev, psn_id: e.target.value }))}
                placeholder="Enter your PSN ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_platform">Preferred Platform</Label>
              <Select
                value={formData.preferred_platform}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xbox">Xbox</SelectItem>
                  <SelectItem value="playstation">PlayStation</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
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

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
