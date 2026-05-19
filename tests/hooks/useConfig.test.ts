import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConfig } from '@/hooks/useConfig'

describe('useConfig', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useConfig())

    expect(result.current.config.mode).toBe('user')
    expect(result.current.config.sourceDisk).toBe('C:')
    expect(result.current.config.destination).toBe('D:\\backup\\users')
    expect(result.current.config.selectedUsers).toEqual([])
    expect(result.current.config.options.multiThread).toBe(16)
    expect(result.current.config.options.waitSeconds).toBe(1)
    expect(result.current.config.options.retries).toBe(1)
    expect(result.current.config.options.excludeCaches).toBe(true)
  })

  it('should update mode', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setMode('disk')
    })

    expect(result.current.config.mode).toBe('disk')
  })

  it('should update source disk', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setSourceDisk('E:')
    })

    expect(result.current.config.sourceDisk).toBe('E:')
  })

  it('should update destination', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setDestination('D:/custom-backup')
    })

    expect(result.current.config.destination).toBe('D:/custom-backup')
  })

  it('should update selected users', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setSelectedUsers(['user1', 'user2'])
    })

    expect(result.current.config.selectedUsers).toEqual(['user1', 'user2'])
  })

  it('should toggle user selection', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.toggleUser('user1')
      result.current.toggleUser('user2')
    })

    expect(result.current.config.selectedUsers).toEqual(['user1', 'user2'])

    act(() => {
      result.current.toggleUser('user1')
    })

    expect(result.current.config.selectedUsers).toEqual(['user2'])
  })

  it('should update options', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.updateOptions({ waitSeconds: 5, retries: 3, multiThread: 32 })
    })

    expect(result.current.config.options.waitSeconds).toBe(5)
    expect(result.current.config.options.retries).toBe(3)
    expect(result.current.config.options.multiThread).toBe(32)
  })

  it('should toggle excludeCaches', () => {
    const { result } = renderHook(() => useConfig())

    expect(result.current.config.options.excludeCaches).toBe(true)

    act(() => {
      result.current.updateOptions({ excludeCaches: false })
    })

    expect(result.current.config.options.excludeCaches).toBe(false)
  })

  it('should validate empty source disk', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setSourceDisk('')
    })

    const error = result.current.validate()

    expect(error).toBe('Seleccione un disco origen')
  })

  it('should validate empty destination', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setDestination('')
    })

    const error = result.current.validate()

    expect(error).toBe('El directorio destino es requerido')
  })

  it('should validate no users selected in user mode', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setDestination('D:/backup')
    })

    const error = result.current.validate()

    expect(error).toBe('Seleccione al menos un usuario')
  })

  it('should pass validation in user mode with users selected', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setDestination('D:/backup')
      result.current.toggleUser('user1')
    })

    const error = result.current.validate()

    expect(error).toBeNull()
  })

  it('should pass validation in disk mode', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setMode('disk')
    })

    const error = result.current.validate()

    expect(error).toBeNull()
  })

  it('should build command args with cache exclusion enabled', () => {
    const { result } = renderHook(() => useConfig())

    const args = result.current.buildCommandArgs()

    expect(args).toContain('/E')
    expect(args).toContain('/ZB')
    expect(args).toContain('/MT:16')
    expect(args).toContain('/W:1')
    expect(args).toContain('/R:1')
    expect(args).toContain('/NP')
    expect(args).toContain('/XJ')
    expect(args).toContain('/XD')
    expect(args).toContain('AppData')
    expect(args).toContain('.cache')
    expect(args).toContain('.cargo')
    expect(args).toContain('/XF')
    expect(args).toContain('NTUSER.DAT')
  })

  it('should build command args without cache exclusion when disabled', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.updateOptions({ excludeCaches: false })
    })

    const args = result.current.buildCommandArgs()

    expect(args).toContain('/XD')
    expect(args).toContain('AppData')
    expect(args).not.toContain('.cache')
    expect(args).not.toContain('.cargo')
  })

  it('should persist config to localStorage', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.setDestination('D:/custom')
      result.current.toggleUser('testuser')
    })

    const saved = JSON.parse(localStorage.getItem('robocopy-config') || '{}')
    expect(saved.destination).toBe('D:/custom')
    expect(saved.selectedUsers).toEqual(['testuser'])
  })

  it('should clear selected users when changing mode', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.toggleUser('user1')
      result.current.setMode('disk')
    })

    expect(result.current.config.selectedUsers).toEqual([])
  })

  it('should clear selected users when changing disk', () => {
    const { result } = renderHook(() => useConfig())

    act(() => {
      result.current.toggleUser('user1')
      result.current.setSourceDisk('E:')
    })

    expect(result.current.config.selectedUsers).toEqual([])
  })
})
