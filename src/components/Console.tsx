import { useRef, useEffect } from 'react'
import { useConsole } from '@/hooks/useConsole'
import styles from './Console.module.css'

interface ConsoleProps {
  output: string
}

export function Console({ output }: ConsoleProps) {
  const { lines, containerRef, appendStream, clear } = useConsole()
  const prevOutputRef = useRef('')

  useEffect(() => {
    if (output !== prevOutputRef.current) {
      const newOutput = output.slice(prevOutputRef.current.length)
      if (newOutput) {
        appendStream(newOutput)
      }
      prevOutputRef.current = output
    }
  }, [output, appendStream])

  useEffect(() => {
    return () => clear()
  }, [clear])

  return (
    <div className={styles.console}>
      <div className={styles.header}>
        <span className={styles.title}>ROBOCOPY CONSOLE v1.0</span>
        <span className={styles.separator}>═══════════════════════════════════════════</span>
      </div>
      <div ref={containerRef} className={styles.output}>
        {lines.length === 0 && (
          <div className={styles.welcome}>
            <p>Bienvenido a RobocopyApp</p>
            <p>Seleccione un modo de copia para comenzar...</p>
            <p>&nbsp;</p>
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className={styles.line}>
            {line.text}
          </div>
        ))}
        <div className={styles.prompt}>
          <span className={styles.amber}>C:\&gt;</span>
          <span className={styles.cursor}>_</span>
        </div>
      </div>
    </div>
  )
}
