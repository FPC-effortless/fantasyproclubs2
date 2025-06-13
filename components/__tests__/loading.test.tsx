import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Loading } from '../loading'

describe('Loading', () => {
  it('renders with default props', () => {
    const { container } = render(<Loading />)
    const spinner = container.firstChild?.firstChild
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('h-8 w-8')
    expect(spinner).toHaveClass('border-muted-foreground/20')
    expect(spinner).toHaveClass('border-t-muted-foreground')
  })

  it('renders with custom size', () => {
    const { container } = render(<Loading size="lg" />)
    const spinner = container.firstChild?.firstChild
    expect(spinner).toHaveClass('h-12 w-12')
  })

  it('renders with custom variant', () => {
    const { container } = render(<Loading variant="secondary" />)
    const spinner = container.firstChild?.firstChild
    expect(spinner).toHaveClass('border-secondary/20')
    expect(spinner).toHaveClass('border-t-secondary')
  })

  it('renders with custom className', () => {
    const { container } = render(<Loading className="custom-class" />)
    const spinner = container.firstChild?.firstChild
    expect(spinner).toHaveClass('custom-class')
  })

  it('renders with all custom props', () => {
    const { container } = render(
      <Loading size="sm" variant="primary" className="custom-class" />
    )
    const spinner = container.firstChild?.firstChild
    expect(spinner).toHaveClass('h-4 w-4')
    expect(spinner).toHaveClass('border-primary/20')
    expect(spinner).toHaveClass('border-t-primary')
    expect(spinner).toHaveClass('custom-class')
  })

  it('has correct ARIA attributes for accessibility', () => {
    const { container } = render(<Loading />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveAttribute('role', 'status')
    expect(wrapper).toHaveAttribute('aria-label', 'Loading')
  })

  it('maintains consistent structure across different variants', () => {
    const { container: defaultContainer } = render(<Loading />)
    const { container: customContainer } = render(
      <Loading size="lg" variant="primary" className="custom-class" />
    )

    const defaultSpinner = defaultContainer.firstChild?.firstChild
    const customSpinner = customContainer.firstChild?.firstChild

    expect(defaultSpinner).toHaveClass('animate-spin')
    expect(defaultSpinner).toHaveClass('rounded-full')
    expect(defaultSpinner).toHaveClass('border-2')

    expect(customSpinner).toHaveClass('animate-spin')
    expect(customSpinner).toHaveClass('rounded-full')
    expect(customSpinner).toHaveClass('border-2')
  })

  it('applies correct size classes for all size options', () => {
    const { container: smContainer } = render(<Loading size="sm" />)
    const { container: mdContainer } = render(<Loading size="md" />)
    const { container: lgContainer } = render(<Loading size="lg" />)

    expect(smContainer.firstChild?.firstChild).toHaveClass('h-4 w-4')
    expect(mdContainer.firstChild?.firstChild).toHaveClass('h-8 w-8')
    expect(lgContainer.firstChild?.firstChild).toHaveClass('h-12 w-12')
  })

  it('applies correct variant classes for all variant options', () => {
    const { container: defaultContainer } = render(<Loading variant="default" />)
    const { container: primaryContainer } = render(<Loading variant="primary" />)
    const { container: secondaryContainer } = render(<Loading variant="secondary" />)

    expect(defaultContainer.firstChild?.firstChild).toHaveClass('border-muted-foreground/20')
    expect(defaultContainer.firstChild?.firstChild).toHaveClass('border-t-muted-foreground')

    expect(primaryContainer.firstChild?.firstChild).toHaveClass('border-primary/20')
    expect(primaryContainer.firstChild?.firstChild).toHaveClass('border-t-primary')

    expect(secondaryContainer.firstChild?.firstChild).toHaveClass('border-secondary/20')
    expect(secondaryContainer.firstChild?.firstChild).toHaveClass('border-t-secondary')
  })
}) 
