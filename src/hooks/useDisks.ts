import { useState, useEffect } from 'react'
import { DiskInfo } from '@/types/electron.d'

export function useDisks() {
  const [disks, setDisks] = useState<DiskInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchDisks = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await window.electronAPI.getDisks()
        if (mounted) {
          setDisks(result)
        }
      } catch (err) {
        if (mounted) {
          setError('No se pudieron detectar los discos')
          setDisks([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDisks()

    return () => {
      mounted = false
    }
  }, [])

  return { disks, loading, error }
}
