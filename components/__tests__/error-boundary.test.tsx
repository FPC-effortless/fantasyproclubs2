import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ErrorBoundary } from '../error-boundary'

const ThrowError = () => {
  throw new Error('Test error')
}

const CustomFallback = () => <div>Custom error UI</div>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('resets error state when retry is clicked', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    await user.click(screen.getByText(/try again/i))
    
    // Re-render with a non-error component
    rerender(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('logs error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('displays default error message when error has no message', () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error()
    }
    
    render(
      <ErrorBoundary>
        <ThrowErrorWithoutMessage />
      </ErrorBoundary>
    )
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
  })

  it('maintains error state when retry fails', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    await user.click(screen.getByText(/try again/i))
    
    // Re-render with another error
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('preserves error state when fallback is provided', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
    
    // Re-render with same error but different fallback
    rerender(
      <ErrorBoundary fallback={<div>New fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('New fallback')).toBeInTheDocument()
  })
}) 
