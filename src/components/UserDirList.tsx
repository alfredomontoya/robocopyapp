import styles from './UserDirList.module.css'

interface UserDirListProps {
  directories: string[]
  loading?: boolean
}

export function UserDirList({ directories, loading }: UserDirListProps) {
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>DIRECTORIOS DE USUARIO:</span>
        <span className={styles.count}>{directories.length} encontrado(s)</span>
      </div>
      <div className={styles.list}>
        {directories.map(dir => (
          <div key={dir} className={styles.item}>
            <span className={styles.icon}>&gt;</span>
            <span className={styles.name}>{dir}</span>
          </div>
        ))}
      </div>
      <div className={styles.info}>
        Se copiaran todos los directorios automaticamente
      </div>
    </div>
  )
}
