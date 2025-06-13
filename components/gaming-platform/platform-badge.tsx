import { useState } from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface PlatformBadgeProps {
  platform: 'xbox' | 'playstation'
  gamertag: string
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  className?: string
}

const platformIcons = {
  xbox: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#107C10]">
      <path d="M6.5 3.5c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H7c-.3 0-.5-.2-.5-.5v-17zm10.5 0H7v17h10v-17z" />
      <path d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5S10.1 8.5 12 8.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
    </svg>
  ),
  playstation: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#003791]">
      <path d="M8.5 3.5c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5v-17zm6 0H9v17h5.5v-17z" />
      <path d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5S10.1 8.5 12 8.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
    </svg>
  ),
}

const sizeClasses = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-4 text-base',
}

export function PlatformBadge({
  platform,
  gamertag,
  size = 'md',
  isLoading = false,
  className,
}: PlatformBadgeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gamertag)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Gamertag copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy gamertag',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5',
          sizeClasses[size],
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  if (!gamertag) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-gray-400',
          sizeClasses[size],
          className
        )}
      >
        <span>No gamertag set</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5',
        sizeClasses[size],
        className
      )}
    >
      <div className="h-5 w-5">{platformIcons[platform]}</div>
      <span className="font-medium text-white">{gamertag}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-white/10"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-[#00ff87]" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </Button>
    </div>
  )
} 
