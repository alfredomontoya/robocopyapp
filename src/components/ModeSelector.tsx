import styles from './ModeSelector.module.css'

interface ModeSelectorProps {
  mode: 'user' | 'disk'
  onChange: (mode: 'user' | 'disk') => void
  disabled?: boolean
}

export function ModeSelector({ mode, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>MODO DE COPIA:</div>
      <div className={styles.options}>
        <button
          className={`${styles.option} ${mode === 'user' ? styles.selected : ''}`}
          onClick={() => onChange('user')}
          disabled={disabled}
        >
          <span className={styles.key}>[1]</span>
          <span className={styles.text}>Copiar Archivos de Usuario</span>
        </button>
        <button
          className={`${styles.option} ${mode === 'disk' ? styles.selected : ''}`}
          onClick={() => onChange('disk')}
          disabled={disabled}
        >
          <span className={styles.key}>[2]</span>
          <span className={styles.text}>Copiar Disco Completo</span>
        </button>
      </div>
      <div className={styles.description}>
        {mode === 'user'
          ? '> Seleccione usuarios de un disco para copiar'
          : '> Copie una unidad de disco completa'}
      </div>
    </div>
  )
}
