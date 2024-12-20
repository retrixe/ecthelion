import ky from 'ky'
import config from '../config'
import type { KyInstance } from 'ky/distribution/types/ky'

const nodes: Record<string, string> = config.nodes ?? {}

const defaultKy = ky.create({
  throwHttpErrors: false,
  prefixUrl: config.ip,
  hooks: {
    beforeRequest: [
      req => req.headers.set('Authorization', localStorage.getItem('ecthelion:token') ?? ''),
    ],
  },
})

const kyInstances = {
  default: defaultKy,
  nodes: Object.keys(nodes).reduce<Record<string, typeof ky>>((obj, node) => {
    obj[node] = defaultKy.extend({ prefixUrl: nodes[node] })
    return obj
  }, {}),
}

export default function useKy(node?: string): KyInstance {
  return node ? kyInstances.nodes[node] : kyInstances.default
}
