import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'
import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import ConsoleView from '../../../imports/dashboard/console/consoleView'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

const Console = () => {
  const [, setWs] = useState<WebSocket | null>(null)
  const [consoleText, setConsole] = useState('Loading...')
  // const [confirmingKill, setConfirmingKill] = useState(false)
  const [listening, setListening] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

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
              <ConsoleView console={consoleText} />
            )
          )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Console
