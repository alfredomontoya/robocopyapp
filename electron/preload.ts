import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getDisks: () => ipcRenderer.invoke('get-disks'),
  getUserDirs: (diskLetter: string) => ipcRenderer.invoke('get-user-dirs', diskLetter),
  executeRobocopy: (taskConfig: {
    taskId: string
    source: string
    destination: string
    options: string[]
  }) => {
    ipcRenderer.send('execute-robocopy', taskConfig)
  },
  cancelRobocopy: (taskId: string) => {
    ipcRenderer.send('cancel-robocopy', taskId)
  },
  onOutput: (callback: (data: { taskId: string; data: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, d: { taskId: string; data: string }) => callback(d)
    ipcRenderer.on('robocopy-output', handler)
    return () => ipcRenderer.removeListener('robocopy-output', handler)
  },
  onComplete: (callback: (data: { taskId: string; code: number | null; status: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, d: { taskId: string; code: number | null; status: string }) => callback(d)
    ipcRenderer.on('robocopy-complete', handler)
    return () => ipcRenderer.removeListener('robocopy-complete', handler)
  },
})
