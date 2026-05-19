import { RobocopyTask } from '@/types/electron.d'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: RobocopyTask
  onCancel: () => void
  onRemove: () => void
}

function getStatusLabel(status: RobocopyTask['status']): string {
  switch (status) {
    case 'idle': return 'PENDIENTE'
    case 'running': return 'EJECUTANDO'
    case 'success': return 'COMPLETADO'
    case 'error': return 'ERROR'
    case 'cancelled': return 'CANCELADO'
  }
}

export function TaskCard({ task, onCancel, onRemove }: TaskCardProps) {
  const statusClass = styles[task.status] || styles.idle
  const filled = Math.min(20, Math.round((task.progress / 100) * 20))
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled)

  return (
    <div className={`${styles.card} ${statusClass}`}>
      <div className={styles.header}>
        <span className={styles.mode}>
          {task.mode === 'user' ? '[USUARIO]' : '[DISCO]'}
        </span>
        <span className={styles.status}>{getStatusLabel(task.status)}</span>
        {task.code !== null && task.status !== 'running' && task.status !== 'idle' && (
          <span className={styles.code}>[{task.code}]</span>
        )}
      </div>
      <div className={styles.paths}>
        <span className={styles.source}>{task.source}</span>
        <span className={styles.arrow}>&rarr;</span>
        <span className={styles.dest}>{task.destination}</span>
      </div>
      {task.status === 'running' && (
        <div className={styles.progress}>
          <span className={styles.bar}>[{bar}]</span>
          <span className={styles.percent}>{task.progress}%</span>
          <span className={styles.files}>| {task.fileCount} files</span>
        </div>
      )}
      {task.status === 'success' && (
        <div className={styles.progress}>
          <span className={styles.bar} style={{ color: '#00ff00' }}>
            [{'\u2588'.repeat(20)}]
          </span>
          <span className={styles.percent} style={{ color: '#00ff00' }}>100%</span>
        </div>
      )}
      <div className={styles.output}>
        {task.output.split('\n').slice(-3).filter(Boolean).map((line, i) => (
          <div key={i} className={styles.line}>{line}</div>
        ))}
        {task.output === '' && task.status === 'idle' && (
          <div className={styles.waiting}>Esperando inicio...</div>
        )}
      </div>
      <div className={styles.actions}>
        {task.status === 'running' && (
          <button className={styles.cancelBtn} onClick={onCancel}>
            [CANCELAR]
          </button>
        )}
        {task.status !== 'running' && task.status !== 'idle' && (
          <button className={styles.removeBtn} onClick={onRemove}>
            [ELIMINAR]
          </button>
        )}
      </div>
    </div>
  )
}
