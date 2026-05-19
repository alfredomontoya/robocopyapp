import { useState } from 'react'
import styles from './PathInput.module.css'

interface PathInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function PathInput({ label, value, onChange, placeholder, disabled }: PathInputProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
        <span>{label}</span>
        <span className={styles.value}>
          {value || placeholder || '...'}
        </span>
      </button>

      {expanded && (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  )
}
