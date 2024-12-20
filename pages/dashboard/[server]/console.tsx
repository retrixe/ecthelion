import React, { useState, useEffect, useRef, startTransition, useCallback } from 'react'
import { Paper, Typography, TextField, Fab, useTheme } from '@mui/material'
import Check from '@mui/icons-material/Check'
import stripAnsi from 'strip-ansi'

import useInterval from '../../../imports/helpers/useInterval'
import useKy from '../../../imports/helpers/useKy'
import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import ConsoleButtons from '../../../imports/dashboard/console/consoleButtons'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

const CommandTextField = ({
  ws,
  id,
  buffer,
}: {
  ws: WebSocket | null
  id: React.RefObject<number>
  buffer: React.RefObject<{ id: number; text: string }[]>
}): React.JSX.Element => {
  const [command, setCommand] = useState('')
  const [lastCmd, setLastCmd] = useState('')
  const handleCommand = (): void => {
    try {
      if (!command || !ws) return
      buffer.current.push({ id: ++id.current, text: '>' + command })
      const v2 = ws.protocol === 'console-v2'
      ws.send(v2 ? JSON.stringify({ type: 'input', data: command }) : command)
      setLastCmd(command)
      setCommand('')
    } catch (e) {
      console.error(e)
    }
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
      <Fab color='secondary' onClick={handleCommand}>
        <Check />
      </Fab>
    </div>
  )
}

const terminalUi =
  typeof localStorage === 'object' && localStorage.getItem('ecthelion:terminal-ui') === 'true'
    ? { backgroundColor: '#141729', color: '#00cc74' }
    : {}

const Console = ({
  setAuthenticated,
  setServerExists,
}: {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  setServerExists: React.Dispatch<React.SetStateAction<boolean>>
}): React.JSX.Element => {
  const color = useTheme().palette.mode === 'dark' ? '#d9d9d9' : undefined
  const { ip, node, server } = useOctyneData()
  const ky = useKy(node)

  const id = useRef(0)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [listening, setListening] = useState<boolean | null>(null)
  const [consoleText, setConsole] = useState([{ id: id.current, text: '[Ecthelion] Loading...' }])

  const buffer = useRef<{ id: number; text: string }[]>([])
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

  const connectedOnce = useRef(false) // Prevents firstMessage from being added again and again.
  const versionFallback = useRef(false) // If server doesn't support v2, fallback to v1.
  const connectToServer = useCallback(
    async (ignore: { current?: boolean }) => {
      if (!server) return
      try {
        // Connect to console.
        // document.cookie = `X-Authentication=${localStorage.getItem('ecthelion:token')}`
        const ticket = await ky.get('ott')
        if (ignore.current) return // If useEffect was called again by React, drop this.
        setListening(true)
        if (ticket.status === 401) {
          setAuthenticated(false)
          return
        }
        const ott = encodeURIComponent((await ticket.json<{ ticket: string }>()).ticket)
        const wsIp = ip.replace('http', 'ws').replace('https', 'wss')
        let firstMessage = true
        const protocol = versionFallback.current ? undefined : 'console-v2'
        const newWS = new WebSocket(`${wsIp}/server/${server}/console?ticket=${ott}`, protocol)
        const handleOutputData = (data: string): void => {
          if (firstMessage) {
            firstMessage = false
            data = data.trimStart()
            if (connectedOnce.current) {
              buffer.current.push({
                id: ++id.current,
                text: '[Ecthelion] Reconnected successfully!',
              })
              return
            }
            connectedOnce.current = true
          }
          buffer.current.push(
            ...data.split('\n').map(text => ({ id: ++id.current, text: stripAnsi(text) })),
          )
        }
        newWS.onmessage = (event: MessageEvent<string>): void => {
          if (newWS.protocol === 'console-v2') {
            const data = JSON.parse(event.data) // For now, ignore settings and pong.
            if (data.type === 'output') {
              handleOutputData(data.data as string)
            } else if (data.type === 'error') {
              buffer.current.push({ id: ++id.current, text: `[Ecthelion] Error: ${data.message}` })
            } else if (data.type === 'pong') console.log('Pong!')
          } else handleOutputData(event.data)
        }
        let versionFallbackInEffect = false
        newWS.onerror = () => {
          versionFallbackInEffect = !newWS.protocol && !versionFallback.current
          versionFallback.current ||= versionFallbackInEffect
          buffer.current.push({
            id: ++id.current,
            text: versionFallbackInEffect
              ? '[Ecthelion] Console v2 API unsupported! Falling back to v1 (your connection may ' +
                'close randomly and some features may be missing). Upgrade to Octyne v1.1 or newer!' +
                " Note: If you're running Octyne v1.1+ and you still see this message, Ecthelion" +
                ' might be having trouble connecting to Octyne.'
              : '[Ecthelion] An unknown error occurred!',
          })
        }
        newWS.onclose = event => {
          if (event.code === 4401) setAuthenticated(false)
          if (event.code === 4404) setServerExists(false)
          if (event.code >= 4000 && event.code <= 4999) return
          if (versionFallbackInEffect) return setWs(null)
          buffer.current.push({
            id: ++id.current,
            text: '[Ecthelion] The server connection was closed! Reconnecting in 3s...',
          })
          setTimeout(() => {
            setWs(null)
          }, 3000)
        }
        setWs(newWS)
      } catch (e) {
        setListening(false)
        console.error(`An error occurred while connecting to console.\n${e}`)
      }
    },
    [ip, ky, server, setAuthenticated, setServerExists],
  )
  useEffect(() => {
    if (!ws) {
      const ignore = { current: false } // Required to handle React.StrictMode correctly.
      connectToServer(ignore).catch(() => {})
      return () => {
        ignore.current = true
      }
    } else {
      return () => {
        setWs(null) // Remove WebSocket after hot reload to prompt reconnect.
        ws.close(4999, 'manual close')
      }
    }
  }, [connectToServer, ws])
  useInterval(
    useCallback(() => {
      if (ws && ws.readyState === WebSocket.OPEN && ws.protocol === 'console-v2') {
        ws.send(JSON.stringify({ type: 'ping', id: Math.random().toString() }))
      }
    }, [ws]),
    15000,
  )

  const stopStartServer = async (operation: 'START' | 'TERM' | 'KILL'): Promise<void> => {
    if (!server) return
    // Send the request to stop or start the server.
    const res = await ky.post('server/' + server, {
      body: operation === 'KILL' ? 'STOP' : operation, // Octyne 1.0 compatibility.
    })
    if (res.status === 400) {
      const json = await res.json<{ error: string }>()
      const text =
        json.error === 'Invalid operation requested!' && operation === 'TERM'
          ? '[Ecthelion] Gracefully stopping apps requires Octyne 1.1 or newer!'
          : `[Ecthelion] Encountered error performing operation ${operation}: ${json.error}`
      buffer.current.push({ id: ++id.current, text })
    }
    setListening(true)
  }

  return !listening ? ( // TODO: Get rid of height 60vh like Files did.
    <ConnectionFailure loading={listening === null} />
  ) : (
    <Paper style={{ padding: 20 }}>
      <Typography variant='h5' gutterBottom>
        Console - {server}
      </Typography>
      <Paper variant='outlined' style={{ height: '60vh', padding: 10, color, ...terminalUi }}>
        <ConsoleView console={consoleText} />
      </Paper>
      <CommandTextField ws={ws} buffer={buffer} id={id} />
      <ConsoleButtons
        stopStartServer={op => {
          stopStartServer(op).catch(console.error)
        }}
      />
    </Paper>
  )
}

const ConsolePage = (): React.JSX.Element => {
  const { server, nodeExists } = useOctyneData()
  const [serverExists, setServerExists] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)
  return (
    <React.StrictMode>
      <Title
        title={`Console${server ? ' - ' + server : ''} - Ecthelion`}
        description='The output terminal console of a process running on Octyne.'
        url={`/dashboard/${server}/console`}
      />
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        {!nodeExists || !serverExists ? (
          <NotExistsError node={!nodeExists} />
        ) : !authenticated ? (
          <AuthFailure />
        ) : (
          <Console setAuthenticated={setAuthenticated} setServerExists={setServerExists} />
        )}
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default ConsolePage
