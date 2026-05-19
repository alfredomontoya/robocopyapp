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
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>DIRECTORIOS DE USUARIO:</span>
          <span className={styles.loading}>Escaneando...</span>
        </div>
      </div>
    )
  }

  if (directories.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>DIRECTORIOS DE USUARIO:</span>
        </div>
        <div className={styles.empty}>No se encontraron directorios de usuario</div>
      </div>
    )
  }

  const allSelected = directories.length > 0 && directories.every(d => selected.includes(d))
  const someSelected = selected.length > 0 && !allSelected

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>DIRECTORIOS DE USUARIO:</span>
        <div className={styles.actions}>
          <button className={styles.smallBtn} onClick={onSelectAll} disabled={disabled || allSelected}>
            [Todos]
          </button>
          <button className={styles.smallBtn} onClick={onDeselectAll} disabled={disabled || selected.length === 0}>
            [Ninguno]
          </button>
        </div>
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
      <div className={styles.count}>
        {selected.length} de {directories.length} seleccionado(s)
      </div>
    </div>
  )
}
