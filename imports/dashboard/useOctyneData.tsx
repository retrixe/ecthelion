import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import config from '../config'
import useKy from '../helpers/useKy'

interface OctyneData {
  server: string | undefined
  node: string | undefined
  ip: string
  nodeExists: boolean
}

interface OctyneDataWithAuth extends OctyneData {
  auth: boolean | null
  serverExists: boolean | null
  connectionFailure: boolean
}

export const useOctyneAuth = (): OctyneDataWithAuth => {
  const octyneData = useOctyneData()
  const { node, server, nodeExists } = octyneData
  const ky = useKy(node)

  const [auth, setAuth] = useState<null | boolean>(null)
  const [serverExists, setServerExists] = useState<null | boolean>(null)
  const [connectionFailure, setConnectionFailure] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      if (!server || !nodeExists) return
      const servers = await ky.get('servers')
      const resp = await servers.json<Record<string, number>>()
      if (servers.ok) setServerExists(!!resp[server])
      if (servers.ok || servers.status === 401 || servers.status === 403) setAuth(servers.ok)
      else setConnectionFailure(true)
    })().catch(err => { console.error(err); setConnectionFailure(true) })
  }, [ky, nodeExists, server])

  return Object.assign(octyneData, { auth, serverExists, connectionFailure })
}

const useOctyneData = (): OctyneData => {
  const nodes = config.nodes ?? {}
  const router = useRouter()
  const server = router.query.server?.toString()
  const node = router.query.node?.toString()
  const ip = node ? nodes[node] : config.ip
  const nodeExists = !node || !!(node && nodes[node])

  return { server, node, ip, nodeExists }
}

export default useOctyneData
