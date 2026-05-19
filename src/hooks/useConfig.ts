import { useState, useCallback, useEffect } from 'react'

export interface RobocopyConfig {
  mode: 'user' | 'disk'
  sourceDisk: string
  destination: string
  selectedUsers: string[]
  options: RobocopyOptions
}

export interface RobocopyOptions {
  mirror: boolean
  restartable: boolean
  multiThread: number
  waitSeconds: number
  retries: number
  enableLog: boolean
  excludeCaches: boolean
  excludedDirs: string[]
  excludedFiles: string[]
}

const KNOWN_CACHE_DIRS = [
  '.cache', '.cargo', '.codex', '.devdb',
  '.lmstudio', '.ollama', '.overture',
  '.quokka', '.rustup', '.VirtualBox',
]

const DEFAULT_EXCLUDED_DIRS = ['AppData', 'Application Data', 'Cookies', 'Recent', 'OneDrive']

const DEFAULT_OPTIONS: RobocopyOptions = {
  mirror: false,
  restartable: true,
  multiThread: 16,
  waitSeconds: 1,
  retries: 1,
  enableLog: false,
  excludeCaches: true,
  excludedDirs: [...DEFAULT_EXCLUDED_DIRS],
  excludedFiles: ['NTUSER.DAT', 'ntuser.dat.LOG*', 'thumbs.db', 'desktop.ini', '*.tmp'],
}

function getDefaultDestination(mode: 'user' | 'disk', diskLetter: string): string {
  const destDisk = 'D:'
  if (mode === 'user') {
    return `${destDisk}\\backup\\users`
  }
  const letter = diskLetter.replace(':', '').toLowerCase()
  return `${destDisk}\\backup\\disco-${letter}`
}

const STORAGE_KEY = 'robocopy-config'

function loadConfig(): RobocopyConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...parsed,
        options: { ...DEFAULT_OPTIONS, ...parsed.options },
        selectedUsers: parsed.selectedUsers || [],
      }
    }
  } catch {
    // ignore
  }
  return {
    mode: 'user',
    sourceDisk: 'C:',
    destination: getDefaultDestination('user', 'C:'),
    selectedUsers: [],
    options: DEFAULT_OPTIONS,
  }
}

export function useConfig() {
  const [config, setConfig] = useState<RobocopyConfig>(loadConfig)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const setMode = useCallback((mode: 'user' | 'disk') => {
    setConfig(prev => {
      const newDest = getDefaultDestination(mode, prev.sourceDisk)
      return {
        ...prev,
        mode,
        destination: newDest,
        selectedUsers: [],
      }
    })
  }, [])

  const setSourceDisk = useCallback((diskLetter: string) => {
    setConfig(prev => {
      const newDest = getDefaultDestination(prev.mode, diskLetter)
      return {
        ...prev,
        sourceDisk: diskLetter,
        destination: newDest,
        selectedUsers: [],
      }
    })
  }, [])

  const setDestination = useCallback((destination: string) => {
    setConfig(prev => ({ ...prev, destination }))
  }, [])

  const setSelectedUsers = useCallback((users: string[]) => {
    setConfig(prev => ({ ...prev, selectedUsers: users }))
  }, [])

  const toggleUser = useCallback((user: string) => {
    setConfig(prev => {
      const exists = prev.selectedUsers.includes(user)
      return {
        ...prev,
        selectedUsers: exists
          ? prev.selectedUsers.filter(u => u !== user)
          : [...prev.selectedUsers, user],
      }
    })
  }, [])

  const updateOptions = useCallback((options: Partial<RobocopyOptions>) => {
    setConfig(prev => ({
      ...prev,
      options: { ...prev.options, ...options },
    }))
  }, [])

  const buildCommandArgs = useCallback((): string[] => {
    const args: string[] = []
    args.push('/E')
    if (config.options.restartable) args.push('/ZB')
    args.push(`/MT:${config.options.multiThread}`)
    args.push(`/W:${config.options.waitSeconds}`)
    args.push(`/R:${config.options.retries}`)
    args.push('/XJ')

    const dirsToExclude = [...config.options.excludedDirs]
    if (config.options.excludeCaches) {
      dirsToExclude.push(...KNOWN_CACHE_DIRS)
    }

    if (dirsToExclude.length > 0) {
      args.push('/XD', ...dirsToExclude)
    }
    if (config.options.excludedFiles.length > 0) {
      args.push('/XF', ...config.options.excludedFiles)
    }
    if (config.options.enableLog) {
      const logPath = `${process.env.TEMP || 'C:\\Windows\\Temp'}\\robocopy-app\\robocopy_${Date.now()}.log`
      args.push(`/LOG:${logPath}`)
    }
    return args
  }, [config.options])

  const validate = useCallback((): string | null => {
    if (!config.sourceDisk) return 'Seleccione un disco origen'
    if (!config.destination.trim()) return 'El directorio destino es requerido'
    if (config.mode === 'user' && config.selectedUsers.length === 0) {
      return 'Seleccione al menos un usuario'
    }
    return null
  }, [config.sourceDisk, config.destination, config.mode, config.selectedUsers])

  return {
    config,
    setMode,
    setSourceDisk,
    setDestination,
    setSelectedUsers,
    toggleUser,
    updateOptions,
    buildCommandArgs,
    validate,
  }
}
