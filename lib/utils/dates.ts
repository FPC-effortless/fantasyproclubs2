import { format, formatDistance, formatRelative, parseISO } from 'date-fns'

export const formatDate = (date: string | Date, formatStr = 'PPP') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr)
}

export const formatTime = (date: string | Date, formatStr = 'p') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr)
}

export const formatDateTime = (date: string | Date, formatStr = 'PPP p') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr)
}

export const formatRelativeTime = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatRelative(parsedDate, new Date())
}

export const formatDistanceToNow = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(parsedDate, new Date(), { addSuffix: true })
}

export const isPast = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return parsedDate < new Date()
}

export const isFuture = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return parsedDate > new Date()
}

export const isToday = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return (
    parsedDate.getDate() === today.getDate() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getFullYear() === today.getFullYear()
  )
}

export const isTomorrow = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    parsedDate.getDate() === tomorrow.getDate() &&
    parsedDate.getMonth() === tomorrow.getMonth() &&
    parsedDate.getFullYear() === tomorrow.getFullYear()
  )
}

export const isThisWeek = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  return parsedDate >= startOfWeek && parsedDate <= endOfWeek
}

export const isThisMonth = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return (
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getFullYear() === today.getFullYear()
  )
}

export const isThisYear = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return parsedDate.getFullYear() === today.getFullYear()
}

export const getDaysUntil = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  const diffTime = parsedDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getHoursUntil = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  const diffTime = parsedDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60))
}

export const getMinutesUntil = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  const diffTime = parsedDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60))
}

export const getSecondsUntil = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  const diffTime = parsedDate.getTime() - today.getTime()
  return Math.ceil(diffTime / 1000)
}

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

export const formatCountdown = (date: string | Date) => {
  const seconds = getSecondsUntil(date)
  if (seconds < 0) return 'Expired'
  return formatDuration(seconds)
} 
