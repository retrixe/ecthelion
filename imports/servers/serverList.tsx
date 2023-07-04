import React, { useEffect, useCallback, useState } from 'react'
import { Typography, Paper, Divider, List, IconButton, Tooltip } from '@mui/material'
import Replay from '@mui/icons-material/Replay'
import ConnectionFailure from '../errors/connectionFailure'
import ServerListItem from './serverListItem'
import CommandDialog from './commandDialog'
import useInterval from '../helpers/useInterval'
import useKy from '../helpers/useKy'

const ServerList = ({ ip, node, setMessage, setFailure }: {
  ip: string
  node?: string
  setMessage: React.Dispatch<React.SetStateAction<string>>
  setFailure?: React.Dispatch<React.SetStateAction<false | 'logged out' | 'failed'>>
}) => {
  const ky = useKy(node)

  const [server, setServer] = useState('')
  const [servers, setServers] = useState<Record<string, number> | undefined>(undefined)
  // true/false - logged in or logged out.
  // failed - failed to check.
  // null - not yet fetched.
  const [loggedIn, setLoggedInDirect] = useState<boolean | null | 'failed'>(null)

  const setLoggedIn = useCallback((newLoggedIn: typeof loggedIn) => {
    if (setFailure && newLoggedIn === 'failed') setFailure('failed')
    else if (setFailure && newLoggedIn === false) setFailure('logged out')
    setLoggedInDirect(newLoggedIn)
  }, [setLoggedInDirect, setFailure])

  const refetch = useCallback(() => {
    (async () => {
      const servers = await ky.get('servers')
      if (servers.ok) {
        setServers((await servers.json<{ servers: Record<string, number> }>()).servers)
        setLoggedIn(true)
      } else if (servers.status === 401) setLoggedIn(false)
      else setLoggedIn('failed')
    })().catch(e => { console.error(e); setLoggedIn('failed') })
  }, [ky, setLoggedIn, setServers])

  useEffect(refetch, [refetch])
  useInterval(refetch, 1000)

  const handleClose = () => setServer('')
  const runCommand = async (command: string) => {
    const ott = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
    // document.cookie = `X-Authentication=${localStorage.getItem('token')}`
    const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${server}/console?ticket=${ott}`)
    ws.onopen = () => {
      ws.send(command)
      ws.close()
      handleClose()
    }
    ws.onerror = () => setMessage('Failed to send command!')
  }

  const stopStartServer = async (operation: 'START' | 'KILL' | 'TERM', server: string) => {
    try {
      // Send the request to stop or start the server.
      const res = await ky.post('server/' + server, {
        body: operation === 'KILL' ? 'STOP' : operation // Octyne 1.0 compatibility.
      })
      if (res.status === 400) {
        const json = await res.json<{ error: string }>()
        setMessage(json.error === 'Invalid operation requested!' && operation === 'TERM'
          ? 'Gracefully stopping apps requires Octyne 1.1 or newer!'
          : json.error)
      }
    } catch (e: any) { setMessage(e) }
  }

  if (loggedIn === null || loggedIn === 'failed') {
    return (
      <ConnectionFailure
        title={node ? 'Octyne node - ' + node : ''}
        loading={loggedIn === null}
      />
    )
  } else if (!loggedIn) {
    return (
      <Paper style={{ padding: 10 }}>
        <Typography color='red'>Unable to authenticate with Octyne node: {node}!</Typography>
        <Typography>Make sure your nodes are pointed to the same Redis server for authentication!</Typography>
      </Paper>
    )
  } else {
    return servers ? (
      <Paper style={{ padding: 20, marginBottom: '2em' }}>
        {/* Dialog box to show. */}
        {server &&
          <CommandDialog server={server} handleClose={handleClose} runCommand={runCommand} />}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography gutterBottom variant='h5'>Servers{node ? (' - ' + node) : ''}</Typography>
          <div style={{ flex: 1 }} />
          <Tooltip title='Reload'>
            <span style={{ marginBottom: '0.35em' }}>
              <IconButton onClick={refetch}>
                <Replay />
              </IconButton>
            </span>
          </Tooltip>
        </div>
        <Divider />
        <List>
          {Object.keys(servers).map(server => (
            <div key={server}>
              <ServerListItem
                node={node}
                server={server}
                status={servers[server]}
                openDialog={() => setServer(server)}
                stopStartServer={stopStartServer}
              />
              <Divider />
            </div>
          ))}
        </List>
      </Paper>
    ) : <ConnectionFailure loading={false} />
  }
}

export default ServerList
