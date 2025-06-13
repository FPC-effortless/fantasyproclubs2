import { ValidationError } from "@/lib/errors"

interface SanitizeOptions {
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  removeSpecialChars?: boolean
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  allowedChars?: string
}

export function sanitizeString(input: string, options: SanitizeOptions = {}): string {
  let result = input

  // Trim whitespace
  if (options.trim !== false) {
    result = result.trim()
  }

  // Convert to lowercase
  if (options.lowercase) {
    result = result.toLowerCase()
  }

  // Convert to uppercase
  if (options.uppercase) {
    result = result.toUpperCase()
  }

  // Remove special characters
  if (options.removeSpecialChars) {
    result = result.replace(/[^a-zA-Z0-9\s]/g, '')
  }

  // Apply custom pattern
  if (options.pattern) {
    const matches = result.match(options.pattern)
    if (!matches) {
      throw new ValidationError(`Input does not match required pattern`)
    }
    result = matches[0]
  }

  // Allow only specific characters
  if (options.allowedChars) {
    const allowedCharsRegex = new RegExp(`[^${options.allowedChars}]`, 'g')
    result = result.replace(allowedCharsRegex, '')
  }

  // Check length constraints
  if (options.maxLength !== undefined && result.length > options.maxLength) {
    throw new ValidationError(`Input exceeds maximum length of ${options.maxLength} characters`)
  }

  if (options.minLength !== undefined && result.length < options.minLength) {
    throw new ValidationError(`Input must be at least ${options.minLength} characters long`)
  }

  return result
}

export function sanitizeEmail(email: string): string {
  return sanitizeString(email, {
    trim: true,
    lowercase: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  })
}

export function sanitizeUsername(username: string): string {
  return sanitizeString(username, {
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
    allowedChars: 'a-z0-9_-'
  })
}

export function sanitizeGamertag(gamertag: string): string {
  return sanitizeString(gamertag, {
    trim: true,
    minLength: 3,
    maxLength: 15,
    allowedChars: 'a-zA-Z0-9 '
  })
}

export function sanitizePSNId(psnId: string): string {
  return sanitizeString(psnId, {
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 16,
    allowedChars: 'a-z0-9_-'
  })
}

export function sanitizeTeamName(name: string): string {
  return sanitizeString(name, {
    trim: true,
    minLength: 2,
    maxLength: 50,
    allowedChars: 'a-zA-Z0-9 -'
  })
}

export function sanitizeCompetitionName(name: string): string {
  return sanitizeString(name, {
    trim: true,
    minLength: 2,
    maxLength: 100,
    allowedChars: 'a-zA-Z0-9 -'
  })
}

export function sanitizeVenueName(name: string): string {
  return sanitizeString(name, {
    trim: true,
    minLength: 2,
    maxLength: 100,
    allowedChars: 'a-zA-Z0-9 -'
  })
}

export function sanitizeJerseyNumber(number: string): string {
  return sanitizeString(number, {
    trim: true,
    minLength: 1,
    maxLength: 2,
    allowedChars: '0-9'
  })
}

export function sanitizePosition(position: string): string {
  return sanitizeString(position, {
    trim: true,
    uppercase: true,
    minLength: 2,
    maxLength: 3,
    allowedChars: 'A-Z'
  })
} 
