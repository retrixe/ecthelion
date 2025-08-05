export interface OctyneConfig {
  port?: number
  unixSocket?: {
    enabled?: boolean
    location?: string
    group?: string
  }
  https?: {
    enabled?: boolean
    cert?: string
    key?: string
  }
  redis?: {
    enabled?: boolean
    url?: string
    role?: string
  }
  webUI?: {
    enabled?: boolean
    port?: number
  }
  servers?: Record<
    string,
    {
      enabled?: boolean // TODO
      directory?: string // TODO
      command?: string // TODO
    }
  >
  logging?: {
    enabled?: boolean
    path?: string
    actions?: Record<string, boolean>
  }
}

export const defaultOctyneConfig = {
  port: 42069,
  unixSocket: {
    enabled: true,
  },
  redis: {
    url: 'redis://localhost',
    role: 'primary',
  },
  webUI: {
    enabled: true,
    port: 7877,
  },
  logging: {
    enabled: true,
    path: 'logs',
  },
}
