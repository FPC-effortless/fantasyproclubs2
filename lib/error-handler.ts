import { toast } from '@/hooks/use-toast'
import { AuthError } from '@supabase/supabase-js'

// Enhanced error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Error handler for database operations
export function handleDatabaseError(error: any): AppError {
  // Supabase/PostgreSQL error codes
  const code = error.code || error.error_code;
  
  switch (code) {
    case '23505': // Unique violation
      return new ValidationError('This record already exists');
    case '23503': // Foreign key violation
      return new ValidationError('Referenced record does not exist');
    case '23502': // Not null violation
      return new ValidationError('Required field is missing');
    case '22P02': // Invalid text representation
      return new ValidationError('Invalid data format');
    case '42703': // Undefined column
      return new ValidationError('Invalid field name');
    case '42P01': // Undefined table
      return new NotFoundError('Resource');
    case '42501': // Insufficient privilege
      return new AuthorizationError('Insufficient permissions');
    case 'PGRST116': // Row level security violation
      return new AuthorizationError('Access denied');
    default:
      console.error('Unhandled database error:', { code, error });
      return new AppError(
        error.message || 'Database operation failed',
        'DATABASE_ERROR',
        500,
        { originalCode: code }
      );
  }
}

// Error handler for authentication operations
export function handleAuthError(error: AuthError | any): AppError {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return new AuthenticationError('Invalid email or password');
      case 'Email not confirmed':
        return new AuthenticationError('Please verify your email before signing in');
      case 'User already registered':
        return new ValidationError('An account with this email already exists');
      case 'Password should be at least 6 characters':
        return new ValidationError('Password must be at least 6 characters long');
      default:
        return new AuthenticationError(error.message);
    }
  }
  
  return new AppError(error.message || 'Authentication failed', 'AUTH_ERROR');
}

// Enhanced error handler with context
export function handleError(
  error: unknown, 
  context?: { 
    operation?: string;
    resource?: string;
    userId?: string;
  }
): AppError {
  // Log error with context for debugging
  console.error('Error occurred:', {
    error,
    context,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AuthError) {
    return handleAuthError(error);
  }

  // Handle Supabase database errors
  if (error && typeof error === 'object' && 'code' in error) {
    return handleDatabaseError(error);
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { ...context, originalName: error.name }
    );
  }

  return new AppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    context
  );
}

// Toast notification helper
export function showErrorToast(error: AppError) {
  const isUserFacingError = [
    'VALIDATION_ERROR',
    'AUTHENTICATION_ERROR',
    'AUTHORIZATION_ERROR',
    'NOT_FOUND',
    'RATE_LIMIT_EXCEEDED'
  ].includes(error.code);

  toast({
    title: isUserFacingError ? "Error" : "Something went wrong",
    description: isUserFacingError 
      ? error.message 
      : "An unexpected error occurred. Please try again.",
    variant: "destructive",
  });
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: { operation?: string; resource?: string }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error, context);
    showErrorToast(appError);
    throw appError;
  }
}

// Form validation helper
export function validateField(
  value: unknown,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  },
  fieldName: string
): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName} is required`;
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

// Retry mechanism for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
} 