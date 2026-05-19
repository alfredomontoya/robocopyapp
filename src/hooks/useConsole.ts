import { useState, useCallback, useRef, useEffect } from 'react'

const MAX_LINES = 50

export interface ConsoleLine {
  text: string
  timestamp: number
}

export function useConsole() {
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addLine = useCallback((text: string) => {
    setLines(prev => {
      const next = [...prev, { text, timestamp: Date.now() }]
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next
    })
  }, [])

  const clear = useCallback(() => {
    setLines([])
  }, [])

  const appendStream = useCallback((data: string) => {
    const textSegments = data.split('\n').filter(line => line.length > 0)
    if (textSegments.length > 0) {
      const newLines = textSegments.map(text => ({
        text,
        timestamp: Date.now(),
      }))
      setLines(prev => {
        const next = [...prev, ...newLines]
        return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next
      })
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  return { lines, containerRef, addLine, clear, appendStream }
}
