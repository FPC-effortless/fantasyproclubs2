import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GamingTagInput } from '@/components/gaming-platform/gaming-tag-input'
import { PlatformSelector } from '@/components/gaming-platform/platform-selector'
import { accountUpgradeSchema, type AccountUpgradeFormData } from '@/lib/validations/account-upgrade'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export function AccountUpgradeForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AccountUpgradeFormData>({
    resolver: zodResolver(accountUpgradeSchema),
    defaultValues: {
      xbox_gamertag: '',
      psn_id: '',
      additional_info: '',
    },
  })

  const onSubmit = async (data: AccountUpgradeFormData) => {
    try {
      setIsLoading(true)

      // Check for duplicate gaming tags
      const { data: existingTags, error: checkError } = await supabase
        .from('users')
        .select('xbox_gamertag, psn_tag')
        .or(`xbox_gamertag.eq.${data.xbox_gamertag},psn_tag.eq.${data.psn_id}`)

      if (checkError) throw checkError

      if (existingTags?.length > 0) {
        const duplicateTag = existingTags.find(
          (tag) => tag.xbox_gamertag === data.xbox_gamertag || tag.psn_tag === data.psn_id
        )
        throw new Error(`Gaming tag "${duplicateTag?.xbox_gamertag || duplicateTag?.psn_tag}" is already in use`)
      }

      // Submit upgrade request
      const { error: submitError } = await supabase.from('account_upgrade_requests').insert({
        requested_role: data.requested_role,
        xbox_gamertag: data.xbox_gamertag,
        psn_id: data.psn_id,
        preferred_platform: data.preferred_platform,
        experience_level: data.experience_level,
        team_preference: data.team_preference,
        additional_info: data.additional_info,
        status: 'pending',
      })

      if (submitError) throw submitError

      toast({
        title: 'Request Submitted',
        description: 'Your account upgrade request has been submitted successfully.',
      })

      router.push('/profile')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Requested Role</Label>
          <RadioGroup
            defaultValue="player"
            onValueChange={(value) => setValue('requested_role', value as 'player' | 'manager')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="player" id="player" />
              <Label htmlFor="player">Player</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manager" id="manager" />
              <Label htmlFor="manager">Manager</Label>
            </div>
          </RadioGroup>
          {errors.requested_role && (
            <p className="mt-1 text-sm text-red-500">{errors.requested_role.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <GamingTagInput
            label="Xbox Gamertag"
            value={watch('xbox_gamertag') || ''}
            onChange={(value) => setValue('xbox_gamertag', value)}
            platform="xbox"
            error={errors.xbox_gamertag?.message}
          />

          <GamingTagInput
            label="PlayStation Network ID"
            value={watch('psn_id') || ''}
            onChange={(value) => setValue('psn_id', value)}
            platform="playstation"
            error={errors.psn_id?.message}
          />
        </div>

        <PlatformSelector
          value={watch('preferred_platform') || 'xbox'}
          onChange={(value) => setValue('preferred_platform', value)}
        />
        {errors.preferred_platform && (
          <p className="mt-1 text-sm text-red-500">{errors.preferred_platform.message}</p>
        )}

        <div>
          <Label htmlFor="experience_level">Experience Level</Label>
          <Select
            onValueChange={(value) => setValue('experience_level', value as AccountUpgradeFormData['experience_level'])}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          {errors.experience_level && (
            <p className="mt-1 text-sm text-red-500">{errors.experience_level.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="team_preference">Team Preference</Label>
          <Input
            id="team_preference"
            {...register('team_preference')}
            className="mt-2"
            placeholder="Enter your team preference"
          />
          {errors.team_preference && (
            <p className="mt-1 text-sm text-red-500">{errors.team_preference.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="additional_info">Additional Information</Label>
          <Textarea
            id="additional_info"
            {...register('additional_info')}
            className="mt-2"
            placeholder="Any additional information you'd like to share"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Request'
        )}
      </Button>
    </form>
  )
} 
