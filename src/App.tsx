import { useState, useCallback, useEffect } from 'react'
import { ModeSelector } from '@/components/ModeSelector'
import { DiskSelector } from '@/components/DiskSelector'
import { UserDirPicker } from '@/components/UserDirPicker'
import { PathInput } from '@/components/PathInput'
import { ConfigPanel } from '@/components/ConfigPanel'
import { ConsolePanel } from '@/components/ConsolePanel'
import { TaskCard } from '@/components/TaskCard'
import { useConfig } from '@/hooks/useConfig'
import { useRobocopy } from '@/hooks/useRobocopy'
import { useDisks } from '@/hooks/useDisks'
import { useUserDirs } from '@/hooks/useUserDirs'
import '@/styles/global.css'
import '@/styles/amber-theme.css'
import styles from './App.module.css'

export default function App() {
  const { config, setMode, setSourceDisk, setDestination, setSelectedUsers, toggleUser, updateOptions, buildCommandArgs, validate } = useConfig()
  const { disks, loading: disksLoading } = useDisks()
  const { directories, loading: dirsLoading, scan: scanUserDirs } = useUserDirs()
  const { tasks, addTask, executeTask, cancelTask, removeTask } = useRobocopy()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (config.sourceDisk) {
      scanUserDirs(config.sourceDisk)
    }
  }, [config.sourceDisk, scanUserDirs])

  const handleExecute = useCallback(() => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    if (config.mode === 'user') {
      const options = buildCommandArgs()
      config.selectedUsers.forEach(user => {
        const source = `${config.sourceDisk}\\Users\\${user}`
        const destination = `${config.destination}\\${user}`
        const id = addTask({
          mode: 'user',
          source,
          destination,
          options,
        })
        executeTask(id)
      })
    } else {
      const options = buildCommandArgs()
      const id = addTask({
        mode: 'disk',
        source: `${config.sourceDisk}\\`,
        destination: config.destination,
        options,
      })
      executeTask(id)
    }
  }, [config, validate, buildCommandArgs, addTask, executeTask])

  const allTasks = Array.from(tasks.values())

  return (
    <div className="crt-container crt-flicker">
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.logo}>
            <pre className={styles.ascii}>
{`
██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
██████╔╝██║   ██║██████╔╝██║   ██║██║     ██║   ██║██████╔╝ ╚████╔╝ 
██╔══██╗██║   ██║██╔══██╗██║   ██║██║     ██║   ██║██╔═══╝   ╚██╔╝  
██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗╚██████╔╝██║        ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝        ╚═╝   
`}
            </pre>
            <div className={styles.subtitle}>Backup Utility v3.1</div>
          </div>

          <ModeSelector
            mode={config.mode}
            onChange={setMode}
          />

          <DiskSelector
            disks={disks}
            selected={config.sourceDisk}
            onChange={setSourceDisk}
            loading={disksLoading}
          />

          {config.mode === 'user' && (
            <UserDirPicker
              directories={directories}
              selected={config.selectedUsers}
              onToggle={toggleUser}
              onSelectAll={() => setSelectedUsers(directories)}
              onDeselectAll={() => setSelectedUsers([])}
              loading={dirsLoading}
            />
          )}

          <PathInput
            label="DIRECTORIO DESTINO:"
            value={config.destination}
            onChange={setDestination}
            placeholder={config.mode === 'user' ? 'D:\\backup\\users' : 'D:\\backup\\disco-x'}
          />

          <ConfigPanel
            options={config.options}
            onUpdate={updateOptions}
          />

          {error && (
            <div className={styles.errorMsg}>{error}</div>
          )}

          <button className={styles.executeBtn} onClick={handleExecute}>
            [ EJECUTAR COPIA ]
          </button>

          {allTasks.length > 0 && (
            <div className={styles.taskList}>
              <div className={styles.taskListLabel}>TAREAS ACTIVAS:</div>
              {allTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onCancel={() => cancelTask(task.id)}
                  onRemove={() => removeTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.consoleWrapper}>
          <ConsolePanel tasks={allTasks} />
        </div>
      </div>
    </div>
  )
}
