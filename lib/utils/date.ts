import { format, formatDistance, formatRelative, parseISO } from 'date-fns'

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  const date = parseISO(dateString)
  return format(date, formatStr)
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = parseISO(dateString)
  return formatDistance(date, new Date(), { addSuffix: true })
}

/**
 * Format a date string to a relative format (e.g., "Today at 2:30 PM")
 * @param dateString - ISO date string
 * @returns Relative format string
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = parseISO(dateString)
  return formatRelative(date, new Date())
}

/**
 * Format a date string to a time format (e.g., "2:30 PM")
 * @param dateString - ISO date string
 * @returns Time string
 */
export const formatTime = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'h:mm a')
}

/**
 * Format a date string to a date and time format (e.g., "Mar 15, 2024 at 2:30 PM")
 * @param dateString - ISO date string
 * @returns Date and time string
 */
export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'MMM d, yyyy \'at\' h:mm a')
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isPast = (dateString: string): boolean => {
  const date = parseISO(dateString)
  return date < new Date()
}

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isFuture = (dateString: string): boolean => {
  const date = parseISO(dateString)
  return date > new Date()
}

/**
 * Check if a date is today
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isToday = (dateString: string): boolean => {
  const date = parseISO(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Get the start of the day for a given date
 * @param dateString - ISO date string
 * @returns ISO date string for start of day
 */
export const getStartOfDay = (dateString: string): string => {
  const date = parseISO(dateString)
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  return startOfDay.toISOString()
}

/**
 * Get the end of the day for a given date
 * @param dateString - ISO date string
 * @returns ISO date string for end of day
 */
export const getEndOfDay = (dateString: string): string => {
  const date = parseISO(dateString)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.toISOString()
}

/**
 * Add days to a date
 * @param dateString - ISO date string
 * @param days - Number of days to add
 * @returns ISO date string
 */
export const addDays = (dateString: string, days: number): string => {
  const date = parseISO(dateString)
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + days)
  return newDate.toISOString()
}

/**
 * Subtract days from a date
 * @param dateString - ISO date string
 * @param days - Number of days to subtract
 * @returns ISO date string
 */
export const subtractDays = (dateString: string, days: number): string => {
  const date = parseISO(dateString)
  const newDate = new Date(date)
  newDate.setDate(date.getDate() - days)
  return newDate.toISOString()
}

/**
 * Get the difference in days between two dates
 * @param dateString1 - First ISO date string
 * @param dateString2 - Second ISO date string
 * @returns Number of days difference
 */
export const getDaysDifference = (dateString1: string, dateString2: string): number => {
  const date1 = parseISO(dateString1)
  const date2 = parseISO(dateString2)
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format a duration in milliseconds to a human-readable format
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Get the current date and time in ISO format
 * @returns ISO date string
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString()
}

/**
 * Get the current date in ISO format (start of day)
 * @returns ISO date string
 */
export const getCurrentDate = (): string => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

/**
 * Get the current time in ISO format
 * @returns ISO date string
 */
export const getCurrentTime = (): string => {
  return new Date().toISOString()
} 
