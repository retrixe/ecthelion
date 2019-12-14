import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import { Paper, Typography, TextField, Fab, Divider } from '@material-ui/core'
import Check from '@material-ui/icons/Check'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

const lastEls = (array: any[], size: number) => {
  const length = array.length
  if (length > 650) return array.slice(length - (size - 1))
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

// TODO: To prevent lag from developing, truncate console text internally to 1000 lines.
const Console = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [consoleText, setConsole] = useState('Loading...')
  const [command, setCommand] = useState('')
  const [lastCmd, setLastCmd] = useState('')
  // const [confirmingKill, setConfirmingKill] = useState(false)
  const [listening, setListening] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const router = useRouter()
  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

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

  // Check if the user is authenticated.
  useEffect(() => { authWrapperCheck().then(e => setAuthenticated(e || false)) }, [])
  useEffect(() => {
    if (!router.query.server) return
    try {
      // Connect to console.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${serverIp.split('http').join('ws')}/server/${router.query.server}/console`)
      // This listener needs to be loaded ASAP.
      ws.onmessage = (event) => setConsole(c => c + '\n' + event.data)
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
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Paper elevation={10} style={{ padding: 10, display: 'flex' }}>
                  {/* TODO: Requires massive performance boost as separate component. */}
                  <TextField
                    label='Input'
                    value={command}
                    fullWidth
                    onChange={e => setCommand(e.target.value)}
                    onSubmit={handleCommand}
                    color='secondary'
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
                </Paper>
              </Paper>
            )
          )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Console
