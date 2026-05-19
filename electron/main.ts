import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'
import fs from 'fs'
import { execSync } from 'child_process'

function isAdministrator(): boolean {
  try {
    execSync('fsutil dirty query %systemdrive%', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function restartAsAdministrator(): void {
  if (process.platform !== 'win32') return

  const script = `Start-Process -FilePath "${process.execPath}" -Verb RunAs`
  spawn('powershell', ['-NoProfile', '-Command', script], {
    detached: true,
    stdio: 'ignore',
  }).unref()

  app.quit()
}

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined

if (!isAdministrator() && !isDev) {
  restartAsAdministrator()
}

if (!isAdministrator() && isDev) {
  console.warn('ADVERTENCIA: La app no se ejecuta como administrador.')
  console.warn('En modo desarrollo, ejecute la terminal como administrador manualmente.')
  console.warn('Algunas copias pueden fallar por permisos.')
}

let mainWindow: BrowserWindow | null = null
const robocopyProcesses = new Map<string, ChildProcess>()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true,
    resizable: true,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('get-disks', () => {
  try {
    const output = execSync('fsutil fsinfo drives', { encoding: 'utf-8' })
    const match = output.match(/([A-Z]:)/g)
    const disks = (match || []).map(letter => ({
      letter,
      label: 'Disco local',
      size: 0,
      free: 0,
    }))
    if (disks.length > 0) return disks
  } catch {
    // fallback
  }

  try {
    const output = execSync('wmic logicaldisk get caption,volumename,size,freespace /format:csv', { encoding: 'utf-8' })
    const lines = output.trim().split('\n').slice(1)
    return lines
      .map(line => {
        const parts = line.split(',').filter(Boolean)
        if (parts.length >= 4) {
          const letter = parts[1].trim()
          const label = parts[2].trim() || 'Sin etiqueta'
          const size = parts[3].trim()
          const free = parts[4]?.trim()
          return {
            letter,
            label,
            size: size ? parseInt(size) : 0,
            free: free ? parseInt(free) : 0,
          }
        }
        return null
      })
      .filter(Boolean)
  } catch {
    return []
  }
})

ipcMain.handle('get-user-dirs', (_event, diskLetter: string) => {
  try {
    const usersPath = path.join(diskLetter, 'Users')
    if (!fs.existsSync(usersPath)) {
      return []
    }
    const entries = fs.readdirSync(usersPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !['Public', 'Default', 'Default User', 'All Users'].includes(name))
  } catch {
    return []
  }
})

ipcMain.on('execute-robocopy', (_event, taskConfig) => {
  const { taskId, source, destination, options } = taskConfig

  if (robocopyProcesses.has(taskId)) {
    robocopyProcesses.get(taskId)?.kill()
  }

  const args = [source, destination, ...options]
  const child = spawn('robocopy', args, { windowsHide: true })

  robocopyProcesses.set(taskId, child)

  child.stdout?.on('data', (data) => {
    mainWindow?.webContents.send('robocopy-output', { taskId, data: data.toString() })
  })

  child.stderr?.on('data', (data) => {
    mainWindow?.webContents.send('robocopy-output', { taskId, data: data.toString() })
  })

  child.on('close', (code) => {
    const status = code !== null && code <= 7 ? 'success' : 'error'
    mainWindow?.webContents.send('robocopy-complete', { taskId, code, status })
    robocopyProcesses.delete(taskId)
  })

  child.on('error', (err) => {
    mainWindow?.webContents.send('robocopy-output', { taskId, data: `Error: ${err.message}\n` })
    mainWindow?.webContents.send('robocopy-complete', { taskId, code: 16, status: 'error' })
    robocopyProcesses.delete(taskId)
  })
})

ipcMain.on('cancel-robocopy', (_event, taskId: string) => {
  const child = robocopyProcesses.get(taskId)
  if (child) {
    child.kill()
    robocopyProcesses.delete(taskId)
    mainWindow?.webContents.send('robocopy-output', { taskId, data: '\nOperacion cancelada por el usuario.\n' })
    mainWindow?.webContents.send('robocopy-complete', { taskId, code: null, status: 'cancelled' })
  }
})
