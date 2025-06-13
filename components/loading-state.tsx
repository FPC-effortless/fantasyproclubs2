import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingState({ className, size = 'md', text }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function LoadingOverlay({ className, text }: Omit<LoadingStateProps, 'size'>) {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
      "flex items-center justify-center",
      className
    )}>
      <LoadingState size="lg" text={text} />
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "animate-pulse bg-muted rounded-md",
      className
    )} />
  )
} 
