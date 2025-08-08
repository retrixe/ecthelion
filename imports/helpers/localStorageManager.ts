import type { StorageManager } from '@mui/material'

const localStorageManager: StorageManager = ({ key, storageWindow }) => {
  key = `ecthelion:${key}`
  if (!storageWindow && typeof window !== 'undefined') storageWindow = window
  return {
    get(defaultValue: string) {
      if (typeof window === 'undefined') return undefined
      if (!storageWindow) return defaultValue
      let value
      try {
        value = storageWindow.localStorage.getItem(key)
      } catch {
        // Unsupported
      }
      return value ?? defaultValue
    },
    set: (value: string) => {
      if (storageWindow) {
        try {
          storageWindow.localStorage.setItem(key, value)
        } catch {
          // Unsupported
        }
      }
    },
    subscribe: (handler: (value: string | null) => void) => {
      if (!storageWindow) {
        return () => {
          /* no-op */
        }
      }
      const listener = (event: StorageEvent) => {
        if (event.key === key) handler(event.newValue)
      }
      storageWindow.addEventListener('storage', listener)
      return () => storageWindow.removeEventListener('storage', listener)
    },
  }
}

export default localStorageManager
