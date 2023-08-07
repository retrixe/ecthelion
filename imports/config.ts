import config from '../config.json'

export default config as {
  ip: string
  nodes?: Record<string, string>
  basePath?: string
  cookieAuth?: boolean
}
