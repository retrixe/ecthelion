import config from '../config.json'

export default config as {
  ip: string
  nodes?: { [node: string]: string }
  basePath?: string
}
