import { useState, useCallback, useEffect, useRef } from 'react'
import { RobocopyTask } from '@/types/electron.d'

let taskCounter = 0

function generateTaskId(): string {
  taskCounter++
  return `task-${Date.now()}-${taskCounter}`
}

function parseProgress(output: string): number {
  const lines = output.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(/(\d+)%/)
    if (match) {
      return parseInt(match[1])
    }
  }
  return 0
}

export function useRobocopy() {
  const [tasks, setTasks] = useState<Map<string, RobocopyTask>>(new Map())
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return

    const removeOutput = window.electronAPI.onOutput(({ taskId, data }) => {
      setTasks(prev => {
        const next = new Map(prev)
        const task = next.get(taskId)
        if (task) {
          const newOutput = task.output + data
          const progress = parseProgress(newOutput)
          next.set(taskId, { ...task, output: newOutput, progress })
        }
        return next
      })
    })

    const removeComplete = window.electronAPI.onComplete(({ taskId, code, status }) => {
      setTasks(prev => {
        const next = new Map(prev)
        const task = next.get(taskId)
        if (task) {
          next.set(taskId, {
            ...task,
            status: status as RobocopyTask['status'],
            code,
            progress: status === 'success' ? 100 : task.progress,
          })
        }
        return next
      })
    })

    cleanupRef.current = () => {
      removeOutput()
      removeComplete()
    }

    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const addTask = useCallback((config: Omit<RobocopyTask, 'id' | 'status' | 'output' | 'code' | 'progress'>) => {
    const id = generateTaskId()
    const task: RobocopyTask = {
      ...config,
      id,
      status: 'idle',
      output: '',
      code: null,
      progress: 0,
    }

    setTasks(prev => {
      const next = new Map(prev)
      next.set(id, task)
      return next
    })

    return id
  }, [])

  const executeTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const next = new Map(prev)
      const task = next.get(taskId)
      if (task) {
        next.set(taskId, { ...task, status: 'running', output: '', progress: 0 })
        window.electronAPI.executeRobocopy({
          taskId,
          source: task.source,
          destination: task.destination,
          options: task.options,
        })
      }
      return next
    })
  }, [])

  const cancelTask = useCallback((taskId: string) => {
    window.electronAPI.cancelRobocopy(taskId)
  }, [])

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const next = new Map(prev)
      next.delete(taskId)
      return next
    })
  }, [])

  const getTask = useCallback((taskId: string): RobocopyTask | undefined => {
    return tasks.get(taskId)
  }, [tasks])

  const getAllTasks = useCallback((): RobocopyTask[] => {
    return Array.from(tasks.values())
  }, [tasks])

  const getRunningTasks = useCallback((): RobocopyTask[] => {
    return Array.from(tasks.values()).filter(t => t.status === 'running')
  }, [tasks])

  return {
    tasks,
    addTask,
    executeTask,
    cancelTask,
    removeTask,
    getTask,
    getAllTasks,
    getRunningTasks,
  }
}
