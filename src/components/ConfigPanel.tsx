import { useState } from 'react'
import { RobocopyOptions } from '@/hooks/useConfig'
import styles from './ConfigPanel.module.css'

const KNOWN_CACHE_DIRS = [
  '.cache', '.cargo', '.codex', '.devdb',
  '.lmstudio', '.ollama', '.overture',
  '.quokka', '.rustup', '.VirtualBox',
]

interface ConfigPanelProps {
  options: RobocopyOptions
  onUpdate: (options: Partial<RobocopyOptions>) => void
  disabled?: boolean
}

export function ConfigPanel({ options, onUpdate, disabled }: ConfigPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span className={styles.arrow}>{expanded ? '\u25BC' : '\u25BA'}</span>
        <span>CONFIGURACION ROBOCOPY</span>
      </button>

      {expanded && (
        <div className={styles.panel}>
          <div className={styles.option}>
            <label>
              <span>/E: Copia recursiva (sin purgar destino)</span>
              <span className={styles.value}>ACTIVO</span>
            </label>
          </div>

          <div className={styles.option}>
            <label>
              <input
                type="checkbox"
                checked={options.restartable}
                onChange={(e) => onUpdate({ restartable: e.target.checked })}
                disabled={disabled}
              />
              <span>/ZB - Modo reiniciable con backup</span>
            </label>
          </div>

          <div className={styles.option}>
            <label>
              <span>/MT: Hilos paralelos</span>
              <input
                type="number"
                min={1}
                max={128}
                value={options.multiThread}
                onChange={(e) => onUpdate({ multiThread: parseInt(e.target.value) || 16 })}
                disabled={disabled}
                className={styles.numberInput}
              />
            </label>
          </div>

          <div className={styles.option}>
            <label>
              <span>/W: Espera entre reintentos (seg)</span>
              <input
                type="number"
                min={0}
                max={30}
                value={options.waitSeconds}
                onChange={(e) => onUpdate({ waitSeconds: parseInt(e.target.value) || 1 })}
                disabled={disabled}
                className={styles.numberInput}
              />
            </label>
          </div>

          <div className={styles.option}>
            <label>
              <span>/R: Numero de reintentos</span>
              <input
                type="number"
                min={0}
                max={100}
                value={options.retries}
                onChange={(e) => onUpdate({ retries: parseInt(e.target.value) || 1 })}
                disabled={disabled}
                className={styles.numberInput}
              />
            </label>
          </div>

          <div className={styles.option}>
            <label>
              <input
                type="checkbox"
                checked={options.excludeCaches}
                onChange={(e) => onUpdate({ excludeCaches: e.target.checked })}
                disabled={disabled}
              />
              <span>Excluir cach\u00E9s conocidos</span>
            </label>
          </div>

          {options.excludeCaches && (
            <div className={styles.cacheList}>
              <span className={styles.cacheLabel}>Se excluir\u00E1n:</span>
              <span className={styles.cacheItems}>{KNOWN_CACHE_DIRS.join(', ')}</span>
            </div>
          )}

          <div className={styles.option}>
            <label>
              <input
                type="checkbox"
                checked={options.enableLog}
                onChange={(e) => onUpdate({ enableLog: e.target.checked })}
                disabled={disabled}
              />
              <span>/LOG - Generar archivo de log</span>
            </label>
          </div>

          <div className={styles.exclusions}>
            <span className={styles.exclLabel}>Excluidos siempre:</span>
            <div className={styles.exclList}>
              <span className={styles.exclItem}>/XD: AppData, Application Data, Cookies, Recent, OneDrive</span>
              <span className={styles.exclItem}>/XF: NTUSER.DAT, ntuser.dat.LOG*, thumbs.db, desktop.ini, *.tmp</span>
            </div>
          </div>

          <div className={styles.command}>
            <span className={styles.commandLabel}>Comando:</span>
            <code>robocopy origen destino /E {options.restartable ? '/ZB ' : ''}/MT:{options.multiThread} /W:{options.waitSeconds} /R:{options.retries} /NP /XJ{options.excludeCaches ? ' +cach\u00E9s' : ''}</code>
          </div>
        </div>
      )}
    </div>
  )
}
