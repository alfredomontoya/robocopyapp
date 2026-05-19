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
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>DISCO ORIGEN:</div>
        <div className={styles.loading}>Detectando discos...</div>
      </div>
    )
  }

  if (disks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>DISCO ORIGEN:</div>
        <div className={styles.error}>No se detectaron discos disponibles</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>DISCO ORIGEN:</div>
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
    </div>
  )
}
