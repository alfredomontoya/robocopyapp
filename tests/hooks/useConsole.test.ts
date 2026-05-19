import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConsole } from '@/hooks/useConsole'

describe('useConsole', () => {
  it('should start with empty lines', () => {
    const { result } = renderHook(() => useConsole())

    expect(result.current.lines).toEqual([])
  })

  it('should add a line', () => {
    const { result } = renderHook(() => useConsole())

    act(() => {
      result.current.addLine('Test line')
    })

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0].text).toBe('Test line')
  })

  it('should clear all lines', () => {
    const { result } = renderHook(() => useConsole())

    act(() => {
      result.current.addLine('Line 1')
      result.current.addLine('Line 2')
    })

    expect(result.current.lines).toHaveLength(2)

    act(() => {
      result.current.clear()
    })

    expect(result.current.lines).toEqual([])
  })

  it('should append stream data', () => {
    const { result } = renderHook(() => useConsole())

    act(() => {
      result.current.appendStream('Line 1\nLine 2\nLine 3')
    })

    expect(result.current.lines).toHaveLength(3)
    expect(result.current.lines[0].text).toBe('Line 1')
    expect(result.current.lines[1].text).toBe('Line 2')
    expect(result.current.lines[2].text).toBe('Line 3')
  })

  it('should handle empty stream data', () => {
    const { result } = renderHook(() => useConsole())

    act(() => {
      result.current.appendStream('')
    })

    expect(result.current.lines).toEqual([])
  })

  it('should handle stream with trailing newlines', () => {
    const { result } = renderHook(() => useConsole())

    act(() => {
      result.current.appendStream('Line 1\nLine 2\n')
    })

    expect(result.current.lines).toHaveLength(2)
  })
})
