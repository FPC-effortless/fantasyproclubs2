import { validatePassword } from '@/lib/utils/password-strength'

describe('Password Validation', () => {
  describe('Strong passwords', () => {
    test('should accept password with all requirements', () => {
      const result = validatePassword('Test123!')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.errors).toHaveLength(0)
    })

    test('should accept complex password', () => {
      const result = validatePassword('MySecure@Pass123')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Medium strength passwords', () => {
    test('should classify as medium when missing one requirement', () => {
      const result = validatePassword('TestPassword123') // No special char
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('medium')
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })

  describe('Weak passwords', () => {
    test('should reject password too short', () => {
      const result = validatePassword('Test1!')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    test('should reject password without uppercase', () => {
      const result = validatePassword('test123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    test('should reject password without lowercase', () => {
      const result = validatePassword('TEST123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    test('should reject password without numbers', () => {
      const result = validatePassword('TestPass!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    test('should reject password without special characters', () => {
      const result = validatePassword('TestPass123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })

  describe('Edge cases', () => {
    test('should handle empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.errors.length).toBeGreaterThan(0)
    })

    test('should handle very long password', () => {
      const longPassword = 'A'.repeat(50) + 'a1!'
      const result = validatePassword(longPassword)
      expect(result.isValid).toBe(true)
    })

    test('should validate all special characters', () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>'
      for (const char of specialChars) {
        const password = `Test123${char}`
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
      }
    })
  })
}) 