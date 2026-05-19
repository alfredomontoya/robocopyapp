import { useState } from 'react'
import { DiskInfo } from '@/types/electron.d'
import styles from './DiskSelector.module.css'

interface DiskSelectorProps {
  disks: DiskInfo[]
  selected: string
  onChange: (diskLetter: string) => void
  disabled?: boolean
  loading?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return 'N/A'
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

export function DiskSelector({ disks, selected, onChange, disabled, loading }: DiskSelectorProps) {
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div className={styles.container}>
        <button
          className={styles.toggle}
          onClick={() => setExpanded(!expanded)}
          disabled={disabled}
        >
          <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
          <span>DISCO ORIGEN:</span>
          <span className={styles.value}>Detectando...</span>
        </button>
      </div>
    )
  }

  if (disks.length === 0) {
    return (
      <div className={styles.container}>
        <button
          className={styles.toggle}
          onClick={() => setExpanded(!expanded)}
          disabled={disabled}
        >
          <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
          <span>DISCO ORIGEN:</span>
          <span className={styles.error}>No se detectaron discos</span>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
        <span>DISCO ORIGEN:</span>
        <span className={styles.value}>{selected}</span>
      </button>

      {expanded && (
        <div className={styles.list}>
          {disks.map(disk => (
            <button
              key={disk.letter}
              className={`${styles.disk} ${selected === disk.letter ? styles.selected : ''}`}
              onClick={() => onChange(disk.letter)}
              disabled={disabled}
            >
              <span className={styles.letter}>{disk.letter}</span>
              <span className={styles.info}>
                <span className={styles.diskLabel}>{disk.label}</span>
                <span className={styles.size}>{formatBytes(disk.size)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
