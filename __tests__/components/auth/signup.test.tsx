import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiStepSignup } from '@/components/auth/multi-step-signup'
import { AuthProvider } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    signUp: jest.fn(),
    user: null,
    loading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@/components/providers/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
      },
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    }
  })
}))

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn()
}

describe('MultiStepSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  const renderSignup = () => {
    return render(
      <AuthProvider>
        <MultiStepSignup />
      </AuthProvider>
    )
  }

  describe('Step 1 - Account Creation', () => {
    test('should render initial signup form', () => {
      renderSignup()
      
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument()
    })

    test('should show password validation errors', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(passwordInput, 'weak')
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument()
      })
    })

    test('should show password mismatch error', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmInput = screen.getByPlaceholderText('Confirm Password')
      
      await user.type(passwordInput, 'Test123!')
      await user.type(confirmInput, 'Different123!')
      
      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })

    test('should enable submit button when form is valid', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmInput = screen.getByPlaceholderText('Confirm Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Test123!')
      await user.type(confirmInput, 'Test123!')
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ })
      expect(submitButton).not.toBeDisabled()
    })

    test('should toggle password visibility', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const passwordInput = screen.getByPlaceholderText('Password')
      const toggleButton = screen.getAllByLabelText(/Toggle.*password visibility/)[0]
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Validation', () => {
    test('should require email field', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      expect(emailInput).toBeRequired()
    })

    test('should require password fields', () => {
      renderSignup()
      
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmInput = screen.getByPlaceholderText('Confirm Password')
      
      expect(passwordInput).toBeRequired()
      expect(confirmInput).toBeRequired()
    })

    test('should validate email format', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      await user.type(emailInput, 'invalid-email')
      
      // HTML5 validation should catch this
      expect(emailInput).toBeInvalid()
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderSignup()
      
      const toggleButtons = screen.getAllByLabelText(/Toggle.*password visibility/)
      expect(toggleButtons).toHaveLength(2)
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      const passwordInput = screen.getByPlaceholderText('Password')
      
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
    })
  })

  describe('Loading States', () => {
    test('should show loading state during form submission', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmInput = screen.getByPlaceholderText('Confirm Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Test123!')
      await user.type(confirmInput, 'Test123!')
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Creating Account/)).toBeInTheDocument()
      })
    })

    test('should disable form fields during loading', async () => {
      const user = userEvent.setup()
      renderSignup()
      
      const emailInput = screen.getByPlaceholderText('Email Address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmInput = screen.getByPlaceholderText('Confirm Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Test123!')
      await user.type(confirmInput, 'Test123!')
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(confirmInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })
    })
  })
}) 