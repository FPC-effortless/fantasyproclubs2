"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGamingRealtime } from '@/hooks/use-gaming-realtime'
import { debounce } from 'lodash'
import { cn } from '@/lib/utils'

interface GamingTagInputProps {
  platform: 'xbox' | 'playstation'
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  disabled?: boolean
  error?: string
  className?: string
  label?: string
  required?: boolean
}

const validationPatterns = {
  xbox: /^[a-zA-Z0-9 ]{3,15}$/,
  playstation: /^[a-zA-Z0-9_-]{3,16}$/,
}

const formatHints = {
  xbox: '3-15 characters, letters and numbers only',
  playstation: '3-16 characters, letters, numbers, hyphens, and underscores',
}

export function GamingTagInput({
  platform,
  value,
  onChange,
  onValidationChange,
  disabled = false,
  error,
  className,
  label = 'Gaming Tag',
  required = false,
}: GamingTagInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const { checkGamingTagAvailability } = useGamingRealtime()

  const validateTag = (tag: string): boolean => {
    if (platform === 'xbox') {
      // Xbox gamertag validation
      return /^[a-zA-Z0-9 ]{3,15}$/.test(tag) && !tag.startsWith(' ') && !tag.endsWith(' ')
    } else {
      // PSN ID validation
      return /^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/.test(tag) && !tag.endsWith('-') && !tag.endsWith('_')
    }
  }

  const checkAvailability = debounce(async (tag: string) => {
    if (!tag || !validateTag(tag)) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const available = await checkGamingTagAvailability(platform, tag)
      setIsAvailable(available)
      onValidationChange?.(available)
    } catch (error) {
      console.error('Error checking tag availability:', error)
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }, 500)

  useEffect(() => {
    checkAvailability(value)
    return () => {
      checkAvailability.cancel()
    }
  }, [value])

  const getInputClass = () => {
    if (!value) return ''
    if (isChecking) return 'border-yellow-500'
    if (isAvailable === null) return 'border-red-500'
    return isAvailable ? 'border-green-500' : 'border-red-500'
  }

  const getStatusMessage = () => {
    if (!value) return ''
    if (isChecking) return 'Checking availability...'
    if (isAvailable === null) return 'Invalid format'
    return isAvailable ? 'Available' : 'Already taken'
  }

  const showError = error || (!isAvailable && value)

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={`${platform}-tag`} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={`${platform}-tag`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={getInputClass()}
          placeholder={
            platform === 'xbox'
              ? 'Enter Xbox Gamertag'
              : 'Enter PlayStation Network ID'
          }
        />
        {value && (
          <div
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${
              isChecking
                ? 'text-yellow-500'
                : isAvailable === null
                ? 'text-red-500'
                : isAvailable
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {getStatusMessage()}
          </div>
        )}
      </div>
      {showError ? (
        <p className="text-sm text-red-500">{error || 'Invalid gaming tag format'}</p>
      ) : (
        platform && (
          <p className="text-sm text-gray-400">{formatHints[platform]}</p>
        )
      )}
    </div>
  )
} 
