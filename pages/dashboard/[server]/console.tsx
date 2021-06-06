import React, { useState, useEffect } from 'react'
import { Paper, Typography, TextField, Fab } from '@material-ui/core'
import Check from '@material-ui/icons/Check'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import ConsoleButtons from '../../../imports/dashboard/console/consoleButtons'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

const lastEls = (array: any[], size: number) => {
  const length = array.length
  if (length > size) return array.slice(length - (size - 1))
  else return array
}

let id = 0
const CommandTextField = ({ ws, setConsole }: {
  ws: WebSocket | null,
  setConsole: React.Dispatch<React.SetStateAction<Array<{ id: number, text: string }>>>
}) => {
  const [command, setCommand] = useState('')
  const [lastCmd, setLastCmd] = useState('')
  const handleCommand = () => {
    try {
      if (!command || !ws) return
      setConsole(c => c.concat([{ id: ++id, text: '>' + command }]))
      ws.send(command)
      setLastCmd(command)
      setCommand('')
      return true
    } catch (e) { console.error(e) }
  }
  return (
    <div style={{ display: 'flex', marginTop: 20 }}>
      <TextField
        label='Input'
        value={command}
        fullWidth
        onChange={e => setCommand(e.target.value)}
        onSubmit={handleCommand}
        color='secondary'
        variant='outlined'
        onKeyDown={e => {
          if (e.key === 'Enter') handleCommand()
          else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            setCommand(lastCmd)
            setLastCmd(command)
          }
        }}
      />
      <div style={{ width: 10 }} />
      <Fab color='secondary' onClick={handleCommand}><Check /></Fab>
    </div>
  )
}

// TODO: Batch console updates.
const Console = () => {
  const { ip, server, nodeExists } = useOctyneData()

  const [ws, setWs] = useState<WebSocket | null>(null)
  const [listening, setListening] = useState<boolean|null>(null)
  const [consoleText, setConsole] = useState([{ id: id, text: 'Loading...' }])
  const [serverExists] = useState(true) // TODO: setServerExists
  const [authenticated, setAuthenticated] = useState(true)

  // Check if the user is authenticated.
  useEffect(() => {
    if (!server || !nodeExists) return
    let ws: WebSocket
    (async () => {
      try {
        // Connect to console.
        // document.cookie = `X-Authentication=${localStorage.getItem('token')}`
        const ticket = await fetch(ip + '/ott', {
          headers: { authorization: localStorage.getItem('token') || '' }
        })
        setListening(true)
        if (ticket.status === 401) {
          setAuthenticated(false)
          return
        }
        const ott = encodeURIComponent((await ticket.json()).ticket)
        const wsIp = ip.replace('http', 'ws').replace('https', 'wss')
        ws = new WebSocket(`${wsIp}/server/${server}/console?ticket=${ott}`)
        // This listener needs to be loaded ASAP.
        // Limit the amount of lines in memory to prevent out of memory site crashes :v
        ws.onmessage = (event) => setConsole(c => (
          lastEls(c.concat(event.data.split('\n').map((line: string) => ({ id: ++id, text: line }))), 650)
        ))
        setWs(ws)
        // Register listeners.
        ws.onerror = () => setConsole(c => c.concat([{ id: ++id, text: 'An unknown error occurred.' }]))
        ws.onclose = () => { // takes argument event
          setConsole(c => c.concat([{ id: ++id, text: 'The connection to the server was abruptly closed.' }]))
        }
      } catch (e) {
        setListening(false)
        console.error('Looks like an error occurred while connecting to console.\n' + e)
      }
    })()
    return () => {
      if (ws) ws.close()
    }
  }, [ip, nodeExists, server])

  const stopStartServer = async (operation: 'START' | 'STOP') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + server, {
        headers: { Authorization: token },
        method: 'POST',
        body: operation.toUpperCase()
      })
      if (res.status === 400) throw new Error(res.statusText)
      setListening(true)
    } catch (e) {}
  }

  return (
    <React.StrictMode>
      <Title
        title={`Console${server ? ' - ' + server : ''} - Ecthelion`}
        description='The output terminal console of a process running on Octyne.'
        url={`/dashboard/${server}/console`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!nodeExists || !serverExists ? <NotExistsError node={!nodeExists} />
            : !authenticated ? <AuthFailure /> : (
              !listening ? <ConnectionFailure loading={listening === null} /> : (
                <Paper style={{ padding: 20 }}>
                  <Typography variant='h5' gutterBottom>Console - {server}</Typography>
                  <Paper style={{ height: '60vh', padding: 10, background: '#333', color: '#fff' }}>
                    <ConsoleView console={consoleText} />
                  </Paper>
                  <CommandTextField ws={ws} setConsole={setConsole} />
                  <ConsoleButtons ws={ws} stopStartServer={stopStartServer} />
                </Paper>
              )
            )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Console
