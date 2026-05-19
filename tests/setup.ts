import '@testing-library/jest-dom'
import { vi } from 'vitest'

Object.defineProperty(window, 'electronAPI', {
  value: {
    executeRobocopy: vi.fn(),
    cancelRobocopy: vi.fn(),
    onOutput: vi.fn(() => vi.fn()),
    onComplete: vi.fn(() => vi.fn()),
  },
  writable: true,
})
