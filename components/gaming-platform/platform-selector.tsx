import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PlatformSelectorProps {
  value: 'xbox' | 'playstation' | 'both'
  onChange: (value: 'xbox' | 'playstation' | 'both') => void
  className?: string
  label?: string
  required?: boolean
}

const platforms = [
  {
    value: 'xbox',
    label: 'Xbox',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#107C10]">
        <path
          fill="currentColor"
          d="M6.5 3.5c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H7c-.3 0-.5-.2-.5-.5v-17zm10.5 0H7v17h10v-17z"
        />
      </svg>
    ),
  },
  {
    value: 'playstation',
    label: 'PlayStation',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#003791]">
        <path
          fill="currentColor"
          d="M8.5 3.5c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5v-17zm6 0H9v17h5.5v-17z"
        />
      </svg>
    ),
  },
  {
    value: 'both',
    label: 'Both',
    icon: (
      <div className="flex -space-x-2">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#107C10]">
          <path
            fill="currentColor"
            d="M6.5 3.5c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H7c-.3 0-.5-.2-.5-.5v-17zm10.5 0H7v17h10v-17z"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#003791]">
          <path
            fill="currentColor"
            d="M8.5 3.5c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v17c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5v-17zm6 0H9v17h5.5v-17z"
          />
        </svg>
      </div>
    ),
  },
]

export function PlatformSelector({
  value,
  onChange,
  className,
  label = 'Preferred Platform',
  required = false,
}: PlatformSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={(value) => onChange(value as 'xbox' | 'playstation' | 'both')}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {platforms.map((platform) => (
          <div key={platform.value}>
            <RadioGroupItem
              value={platform.value}
              id={platform.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={platform.value}
              className="flex cursor-pointer flex-col items-center justify-between rounded-lg border-2 border-gray-800 bg-black p-4 hover:bg-gray-900 peer-data-[state=checked]:border-[#00ff87] [&:has([data-state=checked])]:border-[#00ff87]"
            >
              <div className="mb-2">{platform.icon}</div>
              <span className="text-sm font-medium">{platform.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
} 
