import { useState, useCallback } from 'react'

export function useUserDirs() {
  const [directories, setDirectories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (diskLetter: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await window.electronAPI.getUserDirs(diskLetter)
      setDirectories(result)
    } catch {
      setError('No se pudieron leer los directorios de usuario')
      setDirectories([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setDirectories([])
    setError(null)
  }, [])

  return { directories, loading, error, scan, clear }
}
