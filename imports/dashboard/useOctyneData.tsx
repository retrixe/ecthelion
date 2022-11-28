import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import config from '../config'
import useKy from '../helpers/useKy'

const nodeIps = config.nodes as { [index: string]: string }

export const useOctyneAuth = () => {
  const octyneData = useOctyneData()
  const { node, server, nodeExists } = octyneData
  const ky = useKy(node)

  const [auth, setAuth] = useState<null | boolean>(null)
  const [serverExists, setServerExists] = useState<null | boolean>(null)
  const [connectionFailure, setConnectionFailure] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      try {
        if (!server || !nodeExists) return
        const authorization = localStorage.getItem('token')
        if (!authorization) return setAuth(false)
        const servers = await ky.get('servers')
        const resp = await servers.json<{ [server: string]: number }>()
        if (servers.ok) setServerExists(!!resp[server])
        if (servers.ok || servers.status === 401 || servers.status === 403) setAuth(servers.ok)
        else setConnectionFailure(true)
      } catch (e) {}
    })()
  }, [ky, nodeExists, server])

  return Object.assign(octyneData, { auth, serverExists, connectionFailure })
}

const useOctyneData = () => {
  const router = useRouter()
  const server = router.query.server && router.query.server.toString()
  const node = router.query.node && router.query.node.toString()
  const ip = node ? nodeIps[node] : config.ip
  const nodeExists = !node || !!(server && node && nodeIps[node])

  return { server, node, ip, nodeExists }
}

export default useOctyneData
