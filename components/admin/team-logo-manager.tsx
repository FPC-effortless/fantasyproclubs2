'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from "@/lib/supabase/client"
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload } from 'lucide-react'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']

interface TeamLogoManagerProps {
  teams: Team[]
  onTeamUpdate?: () => void
}

export function TeamLogoManager({ teams, onTeamUpdate }: TeamLogoManagerProps) {
  const [uploadingTeamId, setUploadingTeamId] = useState<string | null>(null)
  const [logoFiles, setLogoFiles] = useState<{ [key: string]: File }>({})
  const supabase = createClient()

  const handleFileChange = (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 2MB",
          variant: "destructive",
        })
        return
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }
      setLogoFiles(prev => ({ ...prev, [teamId]: file }))
    }
  }

  const uploadLogo = async (team: Team) => {
    const logoFile = logoFiles[team.id]
    if (!logoFile) return

    try {
      setUploadingTeamId(team.id)

      // Generate a unique file name
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${team.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(filePath, logoFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath)

      // Update team record
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', team.id)

      if (updateError) throw updateError

      toast({
        title: "Logo updated",
        description: `Logo for ${team.name} has been updated successfully`,
      })

      // Delete old logo if it exists
      if (team.logo_url) {
        const oldFileName = team.logo_url.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('team-logos')
            .remove([oldFileName])
        }
      }

      // Clear the file from state
      setLogoFiles(prev => {
        const newState = { ...prev }
        delete newState[team.id]
        return newState
      })

      // Call the update callback if provided
      if (onTeamUpdate) {
        onTeamUpdate()
      }

    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      })
    } finally {
      setUploadingTeamId(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map(team => (
        <Card key={team.id} className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {team.logo_url ? (
                <Image
                  src={team.logo_url}
                  alt={`${team.name} logo`}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500">{team.short_name}</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.short_name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`logo-${team.id}`}>Upload new logo</Label>
              <Input
                id={`logo-${team.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(team.id, e)}
                disabled={uploadingTeamId === team.id}
              />
              <p className="text-xs text-gray-500">
                Maximum file size: 2MB. Supported formats: PNG, JPG, GIF
              </p>
            </div>

            {logoFiles[team.id] && (
              <Button
                onClick={() => uploadLogo(team)}
                disabled={uploadingTeamId === team.id}
                className="w-full"
              >
                {uploadingTeamId === team.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
} 
