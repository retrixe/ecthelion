import React, { useState, useEffect, useRef, startTransition } from 'react'
import { Paper, Typography, TextField, Fab, useTheme } from '@mui/material'
import Check from '@mui/icons-material/Check'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import ConsoleButtons from '../../../imports/dashboard/console/consoleButtons'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: (...args: any[]) => void, delay: number) => {
  const savedCallback = useRef<() => void>()
  // Remember the latest callback.
  useEffect(() => { savedCallback.current = callback }, [callback])
  // Set up the interval.
  useEffect(() => {
    const tick = () => savedCallback.current && savedCallback.current()
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

let id = 0
const CommandTextField = ({ ws, buffer }: {
  ws: WebSocket | null
  buffer: React.MutableRefObject<Array<{ id: number, text: string }>>
}) => {
  const [command, setCommand] = useState('')
  const [lastCmd, setLastCmd] = useState('')
  const handleCommand = () => {
    try {
      if (!command || !ws) return
      buffer.current.push({ id: ++id, text: '>' + command })
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

const terminalUi = typeof localStorage === 'object' && localStorage.getItem('terminal-ui') === 'true'
  ? { backgroundColor: '#141729', color: '#00cc74' } : {}

const Console = ({ setAuthenticated }: {
  // setServerExists: React.Dispatch<React.SetStateAction<boolean>>,
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const color = useTheme().palette.mode === 'dark' ? '#d9d9d9' : undefined
  const { ip, server } = useOctyneData()

  const [ws, setWs] = useState<WebSocket | null>(null)
  const [listening, setListening] = useState<boolean | null>(null)
  const [consoleText, setConsole] = useState([{ id: id, text: 'Loading...' }])

  const buffer = useRef<Array<{ id: number, text: string }>>([])
  useInterval(() => {
    startTransition(() => {
      if (buffer.current.length === 0) return
      const oldBuffer = buffer.current
      buffer.current = []
      if (oldBuffer.length >= 650) setConsole(oldBuffer.slice(oldBuffer.length - 650))
      else if (consoleText.length + oldBuffer.length >= 650) {
        const consoleSlice = consoleText.slice(consoleText.length - (650 - oldBuffer.length))
        consoleSlice.push(...oldBuffer)
        setConsole(consoleSlice)
      } else {
        const dupe = consoleText.slice(0)
        dupe.push(...oldBuffer)
        setConsole(dupe)
      }
    })
  }, 50)

  // Check if the user is authenticated.
  const connectedOnce = useRef(false)
  useEffect(() => {
    if (!server) return
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
        ws.onmessage = (event) => {
          if (!connectedOnce.current) {
            connectedOnce.current = true
            return
          }
          buffer.current.push(...event.data.split('\n').map((text: string) => ({ id: ++id, text })))
        }
        setWs(ws)
        // Register listeners.
        ws.onerror = () => buffer.current.push({ id: ++id, text: 'An unknown error occurred.' })
        ws.onclose = () => { // takes argument event
          buffer.current.push({ id: ++id, text: 'The connection to the server was abruptly closed.' })
        }
      } catch (e) {
        setListening(false)
        console.error(`Looks like an error occurred while connecting to console.\n${e}`)
      }
    })()
    return () => {
      if (ws) ws.close()
    }
  }, [ip, server, setAuthenticated])

  const stopStartServer = async (operation: 'START' | 'STOP') => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !server) return
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

  return !listening
    ? <ConnectionFailure loading={listening === null} />
    : (
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>Console - {server}</Typography>
        <Paper variant='outlined' style={{ height: '60vh', padding: 10, color, ...terminalUi }}>
          <ConsoleView console={consoleText} />
        </Paper>
        <CommandTextField ws={ws} buffer={buffer} />
        <ConsoleButtons ws={ws} stopStartServer={stopStartServer} />
      </Paper>
      )
}

const ConsolePage = () => {
  const { server, nodeExists } = useOctyneData()
  const [serverExists] = useState(true) // TODO: setServerExists
  const [authenticated, setAuthenticated] = useState(true)
  return (
    <React.StrictMode>
      <Title
        title={`Console${server ? ' - ' + server : ''} - Ecthelion`}
        description='The output terminal console of a process running on Octyne.'
        url={`/dashboard/${server}/console`}
      />
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        <div style={{ padding: 20 }}>
          {!nodeExists || !serverExists
            ? <NotExistsError node={!nodeExists} />
            : !authenticated
                ? <AuthFailure />
                : <Console setAuthenticated={setAuthenticated} />}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default ConsolePage
