import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import { Paper, Typography, TextField, Fab, Button, useMediaQuery, useTheme } from '@material-ui/core'
import Check from '@material-ui/icons/Check'
import Stop from '@material-ui/icons/Stop'
import Close from '@material-ui/icons/Close'
import PlayArrow from '@material-ui/icons/PlayArrow'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

const lastEls = (array: any[], size: number) => {
  const length = array.length
  if (length > size) return array.slice(length - (size - 1))
  else return array
}

const isChrome = () => {
  let chrome = false
  try {
    if (
      Object.hasOwnProperty.call(window, 'chrome') &&
      !navigator.userAgent.includes('Trident') &&
      !navigator.userAgent.includes('Edge') // Chromium Edge uses Edg *sad noises*
    ) chrome = true
  } catch (e) { }
  return chrome
}

const CommandTextField = ({ ws, setConsole }: {
  ws: WebSocket | null, setConsole: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [command, setCommand] = useState('')
  const [lastCmd, setLastCmd] = useState('')
  const handleCommand = () => {
    try {
      if (!command || !ws) return
      setConsole(c => `${c}\n>${command}`)
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

// TODO: To prevent lag from developing, truncate console text internally to 1000 lines.
const Console = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [consoleText, setConsole] = useState('Loading...')
  const [confirmingKill, setConfirmingKill] = useState(false)
  const [listening, setListening] = useState(false)
  const [authenticated, setAuthenticated] = useState(true)

  const smallScreen = useMediaQuery(useTheme().breakpoints.only('xs'))
  const router = useRouter()
  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

  // Check if the user is authenticated.
  useEffect(() => { authWrapperCheck().then(e => setAuthenticated(e || false)) }, [])
  useEffect(() => {
    if (!router.query.server) return
    try {
      // Connect to console.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${serverIp.split('http').join('ws')}/server/${router.query.server}/console`)
      // This listener needs to be loaded ASAP.
      // Limit the amount of lines in memory to prevent out of memory site crashes :v
      ws.onmessage = (event) => setConsole(c => lastEls(c.split('\n'), 650).join('\n') + '\n' + event.data)
      setWs(ws)
      setListening(true)
      // Register listeners.
      ws.onerror = () => setConsole(c => c + '\n' + 'An unknown error occurred.')
      ws.onclose = () => { // takes argument event
        setConsole(c => c + '\n' + 'The connection to the server was abruptly closed.')
      }
      return () => ws.close()
    } catch (e) {
      console.error('Looks like an error occurred while connecting to console.\n' + e)
    }
  }, [serverIp, router.query.server])

  const stopStartServer = async (operation: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      // Send the request to stop or start the server.
      const res = await fetch(serverIp + '/server/' + router.query.server, {
        headers: { Authorization: token },
        method: 'POST',
        body: operation.toUpperCase()
      })
      if (res.status === 400) throw new Error(res.statusText)
      setListening(true)
    } catch (e) {}
  }

  const KillButton = (
    <Button
      startIcon={<Close />}
      variant='contained'
      color='default'
      onClick={() => {
        if (confirmingKill) {
          setConfirmingKill(false)
          stopStartServer('STOP')
        } else setConfirmingKill(true)
      }}
      fullWidth={smallScreen}
    >
      {confirmingKill ? 'Confirm Kill?' : 'Kill'}
    </Button>
  )
  const Buttons = (
    <>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <Button
          startIcon={<PlayArrow />}
          variant='contained'
          color='primary'
          onClick={async () => stopStartServer('START')}
          fullWidth={smallScreen}
        >
          Start
        </Button>
        <div style={{ margin: 10 }} />
        <Button
          variant='contained'
          color='primary'
          fullWidth={smallScreen}
          startIcon={<Stop />}
          onClick={() => {
            if (!ws) return
            ws.send('save-all')
            setTimeout(() => ws.send('end'), 1000)
            setTimeout(() => ws.send('stop'), 5000)
          }}
        >
          Stop
        </Button>
        {!smallScreen && <div style={{ margin: 10 }} />}
        {!smallScreen && KillButton}
      </div>
      {smallScreen && <div style={{ margin: 10 }} />}
      {smallScreen && KillButton}
    </>
  )
  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Console - Ecthelion'
        description='The output terminal console of a process running on Octyne.'
        url={`/dashboard/${router.query.server}/console`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!authenticated ? <AuthFailure /> : (
            !listening ? <ConnectionFailure /> : (
              <Paper style={{ padding: 20 }}>
                <Typography variant='h5' gutterBottom>Console - {router.query.server}</Typography>
                {/* TODO: Need to find a good middle ground. */}
                <Paper
                  style={{
                    height: '60vh',
                    padding: 10,
                    background: '#333',
                    color: '#fff'
                  }}
                >
                  {isChrome() ? ( // If it's on Chrome, use the better behaviour of course.
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column-reverse'
                      }}
                    >
                      <div style={{ minHeight: '5px' }} />
                      <Typography variant='body2' style={{ lineHeight: 1.5 }} component='div'>
                        {lastEls(consoleText.split('\n').map((i, index) => (
                          <span key={index} style={{ wordWrap: 'break-word' }}>{i}<br /></span>
                        )), 650) /* Truncate to 650 lines due to performance issues afterwards. */}
                      </Typography>
                    </div>
                  ) : <ConsoleView console={consoleText} />}
                </Paper>
                <CommandTextField ws={ws} setConsole={setConsole} />
                {!smallScreen && (
                  <div
                    style={{
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      marginTop: 10,
                      padding: 10,
                      width: '100%'
                    }}
                  >
                    {Buttons}
                  </div>
                )}
                {smallScreen && (
                  <Paper elevation={10} style={{ marginTop: 10, padding: 10 }}>
                    {Buttons}
                  </Paper>
                )}
              </Paper>
            )
          )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Console
