import { cn } from '@/lib/utils'
import { PasswordStrength } from '@/lib/utils/password-strength'

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  className?: string
}

export function PasswordStrengthIndicator({
  strength,
  className,
}: PasswordStrengthIndicatorProps) {
  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStrengthText = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'Weak'
      case 'medium':
        return 'Medium'
      case 'strong':
        return 'Strong'
      default:
        return ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex h-2 w-full space-x-1">
        <div
          className={cn(
            'h-full w-1/3 rounded-full transition-colors',
            getStrengthColor(strength)
          )}
        />
        <div
          className={cn(
            'h-full w-1/3 rounded-full transition-colors',
            strength !== 'weak' ? getStrengthColor(strength) : 'bg-gray-200'
          )}
        />
        <div
          className={cn(
            'h-full w-1/3 rounded-full transition-colors',
            strength === 'strong' ? getStrengthColor(strength) : 'bg-gray-200'
          )}
        />
      </div>
      <p className="text-sm text-gray-500">{getStrengthText(strength)}</p>
    </div>
  )
} 
