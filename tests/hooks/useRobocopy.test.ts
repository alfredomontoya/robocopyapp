import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRobocopy } from '@/hooks/useRobocopy'

describe('useRobocopy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with no tasks', () => {
    const { result } = renderHook(() => useRobocopy())

    expect(result.current.getAllTasks()).toEqual([])
    expect(result.current.getRunningTasks()).toEqual([])
  })

  it('should add a task', () => {
    const { result } = renderHook(() => useRobocopy())

    act(() => {
      result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\test',
        destination: 'D:\\backup\\users\\test',
        options: ['/E', '/ZB', '/MT:16', '/W:1', '/R:1', '/NP', '/XJ'],
      })
    })

    const tasks = result.current.getAllTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].mode).toBe('user')
    expect(tasks[0].status).toBe('idle')
    expect(tasks[0].source).toBe('C:\\Users\\test')
    expect(tasks[0].progress).toBe(0)
  })

  it('should add a disk mode task', () => {
    const { result } = renderHook(() => useRobocopy())

    act(() => {
      result.current.addTask({
        mode: 'disk',
        source: 'E:\\',
        destination: 'D:\\backup\\disco-e',
        options: ['/E', '/ZB', '/MT:16', '/W:1', '/R:1', '/NP', '/XJ'],
      })
    })

    const tasks = result.current.getAllTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].mode).toBe('disk')
  })

  it('should execute a task', () => {
    const { result } = renderHook(() => useRobocopy())

    let taskId = ''
    act(() => {
      taskId = result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\test',
        destination: 'D:\\backup\\users\\test',
        options: ['/E', '/ZB'],
      })
    })

    act(() => {
      result.current.executeTask(taskId)
    })

    expect(window.electronAPI.executeRobocopy).toHaveBeenCalledWith({
      taskId,
      source: 'C:\\Users\\test',
      destination: 'D:\\backup\\users\\test',
      options: ['/E', '/ZB'],
    })
  })

  it('should cancel a task', () => {
    const { result } = renderHook(() => useRobocopy())

    act(() => {
      result.current.cancelTask('task-123')
    })

    expect(window.electronAPI.cancelRobocopy).toHaveBeenCalledWith('task-123')
  })

  it('should remove a task', () => {
    const { result } = renderHook(() => useRobocopy())

    let taskId = ''
    act(() => {
      taskId = result.current.addTask({
        mode: 'disk',
        source: 'E:\\',
        destination: 'D:\\backup\\disco-e',
        options: ['/E'],
      })
    })

    expect(result.current.getAllTasks()).toHaveLength(1)

    act(() => {
      result.current.removeTask(taskId)
    })

    expect(result.current.getAllTasks()).toHaveLength(0)
  })

  it('should get running tasks only', () => {
    const { result } = renderHook(() => useRobocopy())

    let runningId = ''
    act(() => {
      result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\a',
        destination: 'D:\\backup\\a',
        options: [],
      })
      runningId = result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\b',
        destination: 'D:\\backup\\b',
        options: [],
      })
    })

    act(() => {
      result.current.executeTask(runningId)
    })

    const running = result.current.getRunningTasks()
    expect(running).toHaveLength(1)
    expect(running[0].id).toBe(runningId)
  })

  it('should generate unique task IDs', () => {
    const { result } = renderHook(() => useRobocopy())

    let id1 = ''
    let id2 = ''
    act(() => {
      id1 = result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\a',
        destination: 'D:\\backup\\a',
        options: [],
      })
      id2 = result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\b',
        destination: 'D:\\backup\\b',
        options: [],
      })
    })

    expect(id1).not.toBe(id2)
  })

  it('should initialize task with fileCount 0', () => {
    const { result } = renderHook(() => useRobocopy())

    act(() => {
      result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\test',
        destination: 'D:\\backup\\users\\test',
        options: ['/E'],
      })
    })

    const tasks = result.current.getAllTasks()
    expect(tasks[0].fileCount).toBe(0)
  })

  it('should reset fileCount when executing a task', () => {
    const { result } = renderHook(() => useRobocopy())

    let taskId = ''
    act(() => {
      taskId = result.current.addTask({
        mode: 'user',
        source: 'C:\\Users\\test',
        destination: 'D:\\backup\\users\\test',
        options: ['/E'],
      })
    })

    act(() => {
      result.current.executeTask(taskId)
    })

    const tasks = result.current.getAllTasks()
    expect(tasks[0].fileCount).toBe(0)
    expect(tasks[0].status).toBe('running')
  })
})
