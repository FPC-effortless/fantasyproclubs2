export type PasswordStrength = 'weak' | 'medium' | 'strong'

export interface PasswordValidation {
  isValid: boolean
  strength: PasswordStrength
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let strength: PasswordStrength = 'weak'
  let score = 0

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 1
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  // Determine strength
  if (score >= 4) {
    strength = 'strong'
  } else if (score >= 2) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  }
} 
