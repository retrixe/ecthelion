import ky from 'ky'
import React from 'react'
import config from '../config'

const nodes: { [node: string]: string } = config.nodes ?? {}

const defaultKy = ky.create({
  throwHttpErrors: false,
  prefixUrl: config.ip,
  hooks: {
    beforeRequest: [
      request => request.headers.set('Authorization', localStorage.getItem('token') ?? '')
    ]
  }
})

const KyContext = React.createContext({
  default: defaultKy,
  nodes: Object.keys(nodes).reduce<Record<string, typeof ky>>((obj, node) => {
    obj[node] = defaultKy.extend({ prefixUrl: nodes[node] })
    return obj
  }, {})
})

export default function useKy (node: string | undefined) {
  const kyContext = React.useContext(KyContext)
  return node ? kyContext.nodes[node] : kyContext.default
}
