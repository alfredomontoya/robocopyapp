import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeSelector } from '@/components/ModeSelector'

describe('ModeSelector', () => {
  it('should render both mode options', () => {
    render(<ModeSelector mode="user" onChange={vi.fn()} />)

    expect(screen.getByText('[1]')).toBeTruthy()
    expect(screen.getByText('[2]')).toBeTruthy()
    expect(screen.getByText('Copiar Archivos de Usuario')).toBeTruthy()
    expect(screen.getByText('Copiar Disco Completo')).toBeTruthy()
  })

  it('should show user mode as selected', () => {
    render(<ModeSelector mode="user" onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[0].className).toMatch(/selected/)
  })

  it('should show disk mode as selected', () => {
    render(<ModeSelector mode="disk" onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[1].className).toMatch(/selected/)
  })

  it('should call onChange with user mode when clicked', () => {
    const onChange = vi.fn()
    render(<ModeSelector mode="disk" onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(onChange).toHaveBeenCalledWith('user')
  })

  it('should call onChange with disk mode when clicked', () => {
    const onChange = vi.fn()
    render(<ModeSelector mode="user" onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])

    expect(onChange).toHaveBeenCalledWith('disk')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ModeSelector mode="user" onChange={vi.fn()} disabled />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })
})
