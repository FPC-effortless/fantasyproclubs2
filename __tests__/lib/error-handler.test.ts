import { 
  handleError, 
  handleDatabaseError, 
  ValidationError, 
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} from '@/lib/error-handler'

describe('Error Handler', () => {
  describe('Database Error Handling', () => {
    test('should handle unique constraint violation', () => {
      const dbError = { code: '23505', message: 'duplicate key value' }
      const result = handleDatabaseError(dbError)
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('This record already exists')
      expect(result.code).toBe('VALIDATION_ERROR')
    })

    test('should handle foreign key violation', () => {
      const dbError = { code: '23503', message: 'foreign key violation' }
      const result = handleDatabaseError(dbError)
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Referenced record does not exist')
    })

    test('should handle insufficient privileges', () => {
      const dbError = { code: '42501', message: 'permission denied' }
      const result = handleDatabaseError(dbError)
      
      expect(result).toBeInstanceOf(AuthorizationError)
      expect(result.message).toBe('Insufficient permissions')
    })

    test('should handle row level security violation', () => {
      const dbError = { code: 'PGRST116', message: 'RLS violation' }
      const result = handleDatabaseError(dbError)
      
      expect(result).toBeInstanceOf(AuthorizationError)
      expect(result.message).toBe('Access denied')
    })
  })

  describe('Generic Error Handling', () => {
    test('should handle standard Error objects', () => {
      const error = new Error('Something went wrong')
      const result = handleError(error)
      
      expect(result.message).toBe('Something went wrong')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })

    test('should handle string errors', () => {
      const error = 'String error message'
      const result = handleError(error)
      
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })

    test('should preserve AppError instances', () => {
      const error = new ValidationError('Custom validation error')
      const result = handleError(error)
      
      expect(result).toBe(error)
      expect(result.code).toBe('VALIDATION_ERROR')
    })

    test('should include context in error', () => {
      const error = new Error('Test error')
      const context = { operation: 'test', userId: '123' }
      const result = handleError(error, context)
      
      expect(result.context).toEqual(expect.objectContaining(context))
    })
  })

  describe('Error Classification', () => {
    test('should create ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', 'email')
      
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.status).toBe(400)
      expect(error.context?.field).toBe('email')
    })

    test('should create AuthenticationError correctly', () => {
      const error = new AuthenticationError('Invalid credentials')
      
      expect(error.code).toBe('AUTHENTICATION_ERROR')
      expect(error.status).toBe(401)
    })

    test('should create NotFoundError correctly', () => {
      const error = new NotFoundError('User')
      
      expect(error.message).toBe('User not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.status).toBe(404)
    })
  })
}) 