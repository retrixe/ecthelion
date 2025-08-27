import ky from 'ky'
import type { KyInstance } from 'ky/distribution/types/ky'
import config from '../config'

const nodes: Record<string, string> = config.nodes ?? {}

const defaultKy = ky.create({
  throwHttpErrors: false,
  prefixUrl: config.ip,
  hooks: {
    beforeRequest: [
      req => req.headers.set('Authorization', localStorage.getItem('ecthelion:token') ?? ''),
    ],
    beforeError: [
      async error => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const data = await error.response?.json<{ error?: string }>()
          if (data.error) {
            error.name = 'OctyneError'
            error.message = data.error
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e: unknown) {
          /* Do nothing */
        }

        return error
      },
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
