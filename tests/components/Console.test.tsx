import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Console } from '@/components/Console'

describe('Console', () => {
  it('should render welcome message when no output', () => {
    render(<Console output="" />)

    expect(screen.getByText('Bienvenido a RobocopyApp')).toBeTruthy()
    expect(screen.getByText('Seleccione un modo de copia para comenzar...')).toBeTruthy()
  })

  it('should render the console header', () => {
    render(<Console output="" />)

    expect(screen.getByText('ROBOCOPY CONSOLE v1.0')).toBeTruthy()
  })

  it('should display output lines', () => {
    render(<Console output="Test output line" />)

    expect(screen.getByText('Test output line')).toBeTruthy()
  })

  it('should display the prompt with cursor', () => {
    const { container } = render(<Console output="" />)

    expect(container.textContent).toContain('C:\\>')
  })
})
