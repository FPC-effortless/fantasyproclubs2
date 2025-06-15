"use client"

import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-300 border-t-green-500",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Loading size="lg" />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
      <Loading size="md" className="mb-4" />
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
    </div>
  )
} 
