import type { Database } from "@/types/database"
import { ValidationError, DatabaseError } from "@/lib/errors"
import { ApiResponse, createSuccessResponse, createErrorResponse } from "@/lib/types/api"
import { createClient } from "@/lib/supabase/client"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  formattedTag?: string
  formattedId?: string
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  platform: 'xbox' | 'playstation'
  existingUser?: {
    username: string
    id: string
  }
}

/**
 * Validates an Xbox Gamertag
 * @param tag The gamertag to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validateXboxGamertag(tag: string): ValidationResult {
  const errors: string[] = []
  
  // Trim whitespace and check length
  const trimmedTag = tag.trim()
  if (trimmedTag.length < 3 || trimmedTag.length > 15) {
    errors.push("Xbox Gamertag must be between 3 and 15 characters")
  }

  // Check for valid characters
  if (!/^[a-zA-Z0-9 ]+$/.test(trimmedTag)) {
    errors.push("Xbox Gamertag can only contain letters, numbers, and spaces")
  }

  // Check for consecutive spaces
  if (/\s{2,}/.test(trimmedTag)) {
    errors.push("Xbox Gamertag cannot contain consecutive spaces")
  }

  // Check for leading/trailing spaces
  if (tag !== trimmedTag) {
    errors.push("Xbox Gamertag cannot start or end with spaces")
  }

  return {
    isValid: errors.length === 0,
    errors,
    formattedTag: errors.length === 0 ? trimmedTag : undefined
  }
}

/**
 * Validates a PlayStation Network ID
 * @param id The PSN ID to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validatePSNId(id: string): ValidationResult {
  const errors: string[] = []
  
  // Trim whitespace and check length
  const trimmedId = id.trim()
  if (trimmedId.length < 3 || trimmedId.length > 16) {
    errors.push("PSN ID must be between 3 and 16 characters")
  }

  // Check for valid characters
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
    errors.push("PSN ID can only contain letters, numbers, hyphens, and underscores")
  }

  // Check for starting with number
  if (/^\d/.test(trimmedId)) {
    errors.push("PSN ID cannot start with a number")
  }

  // Check for ending with hyphen/underscore
  if (/[-_]$/.test(trimmedId)) {
    errors.push("PSN ID cannot end with a hyphen or underscore")
  }

  return {
    isValid: errors.length === 0,
    errors,
    formattedId: errors.length === 0 ? trimmedId : undefined
  }
}

/**
 * Checks for duplicate gaming tags in the database
 * @param tag The gaming tag to check
 * @param platform The platform (xbox or playstation)
 * @returns Promise<DuplicateCheckResult> with duplicate status and existing user info if found
 */
export async function checkDuplicateGamingTags(
  tag: string,
  platform: 'xbox' | 'playstation'
): Promise<ApiResponse<DuplicateCheckResult>> {
  const supabase = createClient()
  
  try {
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .eq(platform === 'xbox' ? 'xbox_gamertag' : 'psn_id', tag)
      .single()

    if (error) {
      throw new DatabaseError(error.message)
    }

    const result: DuplicateCheckResult = {
      isDuplicate: !!existingUser,
      platform,
      existingUser: existingUser ? {
        username: tag,
        id: existingUser.id
      } : undefined
    }

    return createSuccessResponse(result)
  } catch (error) {
    if (error instanceof DatabaseError) {
      return createErrorResponse(error.code, error.message)
    }
    return createErrorResponse('UNKNOWN_ERROR', 'Failed to check for duplicate gaming tags')
  }
}

/**
 * Formats a gaming tag according to platform-specific rules
 * @param tag The gaming tag to format
 * @param platform The platform (xbox or playstation)
 * @returns The formatted gaming tag
 */
export function formatGamingTag(tag: string, platform: 'xbox' | 'playstation'): string {
  let formattedTag = tag.trim()

  if (platform === 'xbox') {
    // Remove consecutive spaces
    formattedTag = formattedTag.replace(/\s+/g, ' ')
    // Capitalize first letter of each word
    formattedTag = formattedTag.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  } else {
    // PSN formatting
    // Convert to lowercase
    formattedTag = formattedTag.toLowerCase()
    // Remove any leading/trailing hyphens/underscores
    formattedTag = formattedTag.replace(/^[-_]+|[-_]+$/g, '')
  }

  return formattedTag
}

/**
 * Validates and formats a gaming tag in one step
 * @param tag The gaming tag to validate and format
 * @param platform The platform (xbox or playstation)
 * @returns ValidationResult with validation status, errors, and formatted tag if valid
 */
export function validateAndFormatGamingTag(
  tag: string,
  platform: 'xbox' | 'playstation'
): ValidationResult {
  const validation = platform === 'xbox' 
    ? validateXboxGamertag(tag)
    : validatePSNId(tag)

  if (validation.isValid) {
    return {
      ...validation,
      formattedTag: formatGamingTag(tag, platform)
    }
  }

  return validation
} 
