import { useState } from 'react'
import styles from './UserDirPicker.module.css'

interface UserDirPickerProps {
  directories: string[]
  selected: string[]
  onToggle: (user: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  disabled?: boolean
  loading?: boolean
}

export function UserDirPicker({
  directories,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  disabled,
  loading,
}: UserDirPickerProps) {
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
          <span>DIRECTORIOS DE USUARIO:</span>
          <span className={styles.value}>Escaneando...</span>
        </button>
      </div>
    )
  }

  if (directories.length === 0) {
    return (
      <div className={styles.container}>
        <button
          className={styles.toggle}
          onClick={() => setExpanded(!expanded)}
          disabled={disabled}
        >
          <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
          <span>DIRECTORIOS DE USUARIO:</span>
          <span className={styles.empty}>Sin resultados</span>
        </button>
      </div>
    )
  }

  const allSelected = directories.length > 0 && directories.every(d => selected.includes(d))
  const someSelected = selected.length > 0 && !allSelected

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
        <span>DIRECTORIOS DE USUARIO:</span>
        <span className={styles.count}>
          {selected.length} de {directories.length}
        </span>
      </button>

      {expanded && (
        <>
          <div className={styles.actions}>
            <button className={styles.smallBtn} onClick={onSelectAll} disabled={disabled || allSelected}>
              [Todos]
            </button>
            <button className={styles.smallBtn} onClick={onDeselectAll} disabled={disabled || selected.length === 0}>
              [Ninguno]
            </button>
          </div>
          <div className={styles.list}>
            <label className={`${styles.item} ${allSelected ? styles.checked : ''}`}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected }}
                onChange={() => allSelected ? onDeselectAll() : onSelectAll()}
                disabled={disabled}
              />
              <span className={styles.name} style={{ color: '#ffc840', fontWeight: 'bold' }}>
                {allSelected ? '(Todos seleccionados)' : someSelected ? '(Parcialmente seleccionado)' : '(Seleccionar todos)'}
              </span>
            </label>
            {directories.map(dir => {
              const isSelected = selected.includes(dir)
              return (
                <label key={dir} className={`${styles.item} ${isSelected ? styles.checked : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(dir)}
                    disabled={disabled}
                  />
                  <span className={styles.name}>{dir}</span>
                </label>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
