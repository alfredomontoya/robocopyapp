import { useState, useRef, useEffect } from 'react'
import { RobocopyTask } from '@/types/electron.d'
import styles from './ConsolePanel.module.css'

interface ConsolePanelProps {
  tasks: RobocopyTask[]
}

export function ConsolePanel({ tasks }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const runningTasks = tasks.filter(t => t.status === 'running')
  const completedTasks = tasks.filter(t => t.status !== 'running' && t.status !== 'idle')
  const allTasks = [...runningTasks, ...completedTasks]

  const currentTab = activeTab && allTasks.some(t => t.id === activeTab)
    ? activeTab
    : allTasks.length > 0
      ? allTasks[0].id
      : null

  const activeTask = allTasks.find(t => t.id === currentTab)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [activeTask?.output])

  if (allTasks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>ROBOCOPY CONSOLE v2.0</span>
        </div>
        <div className={styles.empty}>
          <p>No hay tareas en ejecucion</p>
          <p>Configure una copia y presione [EJECUTAR]</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>ROBOCOPY CONSOLE v2.0</span>
        <span className={styles.count}>{allTasks.length} tarea(s)</span>
      </div>
      <div className={styles.tabs}>
        {allTasks.map(task => (
          <button
            key={task.id}
            className={`${styles.tab} ${task.id === currentTab ? styles.active : ''} ${styles[task.status]}`}
            onClick={() => setActiveTab(task.id)}
          >
            <span className={styles.tabLabel}>
              {task.mode === 'user' ? 'USR' : 'DISCO'}
            </span>
            <span className={styles.tabSource}>
              {task.mode === 'user'
                ? task.source.split('\\').pop() || task.source
                : task.source}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.output} ref={outputRef}>
        {activeTask && (
          <>
            <div className={styles.taskInfo}>
              <span>{activeTask.source}</span>
              <span className={styles.arrow}>&rarr;</span>
              <span>{activeTask.destination}</span>
            </div>
            <div className={styles.lines}>
              {activeTask.output.split('\n')
                .filter(Boolean)
                .filter(line => !/^\s*\d+\.?\d*%\s*$/.test(line))
                .map((line, i) => (
                  <div key={i} className={styles.line}>{line}</div>
                ))}
              {activeTask.output === '' && (
                <div className={styles.waiting}>Esperando inicio...</div>
              )}
            </div>
            <div className={styles.prompt}>
              <span className={styles.amber}>C:\&gt;</span>
              <span className={styles.cursor}>_</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
