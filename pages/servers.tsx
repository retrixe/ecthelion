import React, { useState, useEffect } from 'react'
import { Button, Typography, Paper, Divider, List, IconButton, Tooltip } from '@material-ui/core'
import Replay from '@material-ui/icons/Replay'

import Link from 'next/link'
import { ip } from '../config.json'

import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import Message from '../imports/helpers/message'
import AnchorLink from '../imports/helpers/anchorLink'

import CommandDialog from '../imports/servers/commandDialog'
import ServerListItem from '../imports/servers/serverListItem'

import AuthFailure from '../imports/errors/authFailure'
import ConnectionFailure from '../imports/errors/connectionFailure'

// TODO: Un-hardcode the ip variable by importing nodes.

const Servers = () => {
  const [message, setMessage] = useState('')
  const [servers, setServers] = useState<{ [name: string]: number } | undefined>(undefined)
  const [loggedIn, setLoggedIn] = useState<boolean|null|'failed'>(null) // null - not yet fetched.
  const [server, setServer] = useState('')
  const [refetch, setRefetch] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const servers = await fetch(
          ip + '/servers', { headers: { Authorization: token } }
        )
        const parsed = await servers.json()
        if (servers.ok) {
          setServers(parsed.servers)
          setLoggedIn(true)
        } else if (servers.status === 401) setLoggedIn('failed')
        else setLoggedIn(false)
      } catch (e) { setLoggedIn(false) }
    })()
  }, [refetch])

  const handleClose = () => setServer('')
  const runCommand = (command: string) => {
    document.cookie = `X-Authentication=${localStorage.getItem('token')}`
    const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${server}/console`)
    ws.onopen = () => {
      ws.send(command)
      ws.close()
      handleClose()
    }
    ws.onerror = () => setMessage('Failed to send command!')
  }

  const stopStartServer = async (operation: string, server: string) => {
    if (operation === 'stop') {
      // Send commands.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${server}/console`)
      ws.onopen = () => {
        ws.send('save-all')
        setTimeout(() => ws.send('end'), 1000)
        setTimeout(() => { ws.send('stop'); ws.close() }, 5000)
        setTimeout(() => setRefetch(!refetch), 10000)
      }
      ws.onerror = () => setMessage('Failed to send commands!')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (token === null) return
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + server, {
        headers: { Authorization: token },
        method: 'POST',
        body: operation === 'kill' ? 'STOP' : operation.toUpperCase()
      })
      if (res.status === 400) throw new Error()
      else setRefetch(!refetch)
    } catch (e) { setMessage(e) }
  }

  // Return final code.
  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Servers - Ecthelion'
        description='The list of servers on Octyne.'
        url='/servers'
      />
      <Layout
        appBar={
          <>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <Link href='/'>
              <Button
                color='inherit'
                onClick={() => {
                  const token = localStorage.getItem('token')
                  if (token) {
                    fetch(`${ip}/logout`, { headers: { Authorization: token } })
                    localStorage.removeItem('token')
                  }
                }}
              >Logout
              </Button>
            </Link>
            <div style={{ marginRight: 5 }} />
            <AnchorLink prefetch={false} href='/about'>
              <Button color='inherit'>About</Button>
            </AnchorLink>
          </>
        }
      >
        <div style={{ marginTop: '2em', paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
          {!loggedIn ? <ConnectionFailure loading={loggedIn === null} /> : (
            loggedIn === 'failed' ? <AuthFailure /> : (servers ? (
              <Paper style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography gutterBottom variant='h5'>Servers</Typography>
                  <div style={{ flex: 1 }} />
                  <Tooltip title='Reload'>
                    <span style={{ marginBottom: '0.35em' }}>
                      <IconButton onClick={() => setRefetch(!refetch)}>
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
                        name={server}
                        status={servers[server]}
                        openDialog={() => setServer(server)}
                        stopStartServer={stopStartServer}
                      />
                      <Divider />
                    </div>
                  ))}
                </List>
              </Paper>
            ) : <ConnectionFailure loading={false} />)
          )}
        </div>
      </Layout>
      {/* Dialog box to show. */}
      {server &&
        <CommandDialog server={server} handleClose={handleClose} runCommand={runCommand} />}
      {/* Error message to show. */}
      {message && <Message message={message} setMessage={setMessage} />}
    </React.StrictMode>
  )
}

export default Servers
