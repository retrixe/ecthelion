import React, { useState, useEffect, useRef } from 'react'
import { Paper, Typography, TextField, Fab } from '@mui/material'
import Check from '@mui/icons-material/Check'

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
  ws: WebSocket | null,
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

const Console = ({ setAuthenticated }: {
  // setServerExists: React.Dispatch<React.SetStateAction<boolean>>,
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { ip, server } = useOctyneData()

  const [ws, setWs] = useState<WebSocket | null>(null)
  const [listening, setListening] = useState<boolean | null>(null)
  const [consoleText, setConsole] = useState([{ id: id, text: 'Loading...' }])

  const buffer = useRef<Array<{ id: number, text: string }>>([])
  useInterval(() => {
    if (buffer.current.length === 0) return
    const oldBuffer = buffer.current
    buffer.current = []
    setConsole(lastEls(consoleText.concat(oldBuffer), 650))
  }, 50)

  // Check if the user is authenticated.
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
          buffer.current = buffer.current
            .concat(event.data.split('\n').map((line: string) => ({ id: ++id, text: line })))
        }
        setWs(ws)
        // Register listeners.
        ws.onerror = () => buffer.current.push({ id: ++id, text: 'An unknown error occurred.' })
        ws.onclose = () => { // takes argument event
          buffer.current.push({ id: ++id, text: 'The connection to the server was abruptly closed.' })
        }
      } catch (e) {
        setListening(false)
        console.error('Looks like an error occurred while connecting to console.\n' + e)
      }
    })()
    return () => {
      if (ws) ws.close()
    }
  }, [ip, server, setAuthenticated])

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

  return !listening
    ? <ConnectionFailure loading={listening === null} />
    : (
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>Console - {server}</Typography>
        <Paper style={{ height: '60vh', padding: 10, background: '#333', color: '#fff' }}>
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
