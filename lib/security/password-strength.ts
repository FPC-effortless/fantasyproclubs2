interface PasswordValidationResult {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
  score: number
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Length check (minimum 8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  // Lowercase letter check
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

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123|234|345|456|567|678|789|890/, // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
    /password|123456|qwerty|admin|letmein|welcome|monkey|dragon/i // Common passwords
  ]

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
  if (hasCommonPattern) {
    errors.push('Password contains common patterns and may be easily guessed')
    score -= 1
  }

  // Determine strength based on score
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 5 && errors.length === 0) {
    strength = 'strong'
  } else if (score >= 3) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
    score: Math.max(0, score)
  }
}

// Additional security functions
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  let password = ''
  
  // Ensure we have at least one of each required type
  const requiredChars = [
    'abcdefghijklmnopqrstuvwxyz', // lowercase
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // uppercase
    '0123456789', // numbers
    '!@#$%^&*()_+-=' // special chars
  ]
  
  // Add one required character from each set
  requiredChars.forEach(set => {
    password += set[Math.floor(Math.random() * set.length)]
  })
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function checkPasswordBreach(password: string): Promise<boolean> {
  // In a real implementation, you would check against Have I Been Pwned API
  // For now, we'll just check against a small list of common breached passwords
  const commonBreachedPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '111111', '1234567', 'sunshine', 'qwerty', 'iloveyou',
    'princess', 'admin', 'welcome', '666666', 'abc123',
    'football', '123123', 'monkey', '654321', '!@#$%^&*'
  ]
  
  return Promise.resolve(
    commonBreachedPasswords.some(breached => 
      password.toLowerCase().includes(breached.toLowerCase())
    )
  )
} 