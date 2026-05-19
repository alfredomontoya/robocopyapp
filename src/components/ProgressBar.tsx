import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  progress: number
  label?: string
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const filled = Math.round((clampedProgress / 100) * 20)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <span className={styles.filled}>[{bar}]</span>
        <span className={styles.percentage}>{clampedProgress}%</span>
      </div>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  )
}
