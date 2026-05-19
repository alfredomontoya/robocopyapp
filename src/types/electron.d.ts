export interface DiskInfo {
  letter: string
  label: string
  size: number
  free: number
}

export interface RobocopyTask {
  id: string
  mode: 'user' | 'disk'
  source: string
  destination: string
  options: string[]
  status: 'idle' | 'running' | 'success' | 'error' | 'cancelled'
  output: string
  code: number | null
  progress: number
}

export interface ElectronAPI {
  getDisks: () => Promise<DiskInfo[]>
  getUserDirs: (diskLetter: string) => Promise<string[]>
  executeRobocopy: (taskConfig: {
    taskId: string
    source: string
    destination: string
    options: string[]
  }) => void
  cancelRobocopy: (taskId: string) => void
  onOutput: (callback: (data: { taskId: string; data: string }) => void) => () => void
  onComplete: (callback: (data: { taskId: string; code: number | null; status: string }) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
