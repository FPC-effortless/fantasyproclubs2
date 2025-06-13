"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function CreateTeamPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  })

  if (!session) {
    router.push("/login")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push("/login")
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: team, error } = await supabase
        .from("teams")
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            logo_url: formData.logoUrl.trim() || null,
            manager_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Team created successfully!",
      })

      router.push("/teams")
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="bg-[#1a1a1a] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-[#00ff87] text-2xl font-bold text-center">
            Create New Team
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Start your own Pro Clubs team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Team Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="Enter team name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="Tell others about your team..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-white">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] border-[#444444] text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-[#333333] text-white hover:bg-[#333333]"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00ff87] text-black hover:bg-[#00cc6a] font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
