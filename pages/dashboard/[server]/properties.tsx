import React, { useState, useEffect } from 'react'

import { Paper, Typography /* , TextField, LinearProgress, Button */ } from '@mui/material'

import Title from '../../../imports/helpers/title'
import Message from '../../../imports/helpers/message'
import Editor from '../../../imports/dashboard/files/editor'
import AuthFailure from '../../../imports/errors/authFailure'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

const ServerProperties = () => {
  const { ip, server, nodeExists } = useOctyneData()

  const [message, setMessage] = useState('')
  // const [saving, setSaving] = useState(false)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [originalFileContent, setOriginalFileContent] = useState<string | null>(null)
  const [listening, setListening] = useState<boolean | null>(null)
  const [serverExists, setServerExists] = useState(!!server)
  const [authenticated, setAuthenticated] = useState(true)

  // Check if the user is authenticated.
  const fetchedProperties = React.useRef(false)
  useEffect(() => {
    if (!serverExists || !nodeExists || fetchedProperties.current) return
    (async () => {
      try {
        // Fetch server properties.
        const authorization = localStorage.getItem('token')
        if (!authorization) return setAuthenticated(false)
        const res = await fetch(
          `${ip}/server/${server}/file?path=server.properties`, { headers: { authorization } }
        )
        const serverProperties = await res.text()
        if (res.status === 401) setAuthenticated(false)
        else if (res.status === 404) {
          try {
            const json = JSON.parse(serverProperties)
            if (json.error === 'This server does not exist!') setServerExists(false)
          } catch (e) {}
          setListening(true)
        } else if (res.ok) {
          setListening(true)
          setServerExists(true)
          setAuthenticated(true)
          setOriginalFileContent(serverProperties)
          setFileContent(serverProperties)
        }
      } catch (e) { setListening(false) }
    })()
    fetchedProperties.current = true
  }, [ip, server, serverExists, nodeExists])

  return (
    <React.StrictMode>
      <Title
        title={`server.properties${server ? ' - ' + server : ''} - Ecthelion`}
        description='The server.properties of a Minecraft server running on Octyne.'
        url={`/dashboard/${server}/properties`}
      />
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        <div style={{ padding: 20 }}>
          {!nodeExists || !serverExists ? <NotExistsError node={!nodeExists} />
            : !authenticated ? <AuthFailure /> : (
              !listening ? <ConnectionFailure loading={listening === null} /> : (
                <Paper style={{ padding: 20 }}>
                  {originalFileContent === null || fileContent === null ? (
                    <>
                      <Typography variant='h5' gutterBottom>server.properties</Typography>
                      <div style={{ paddingBottom: 10 }} />
                      <Typography>
                        Looks like this server does not have a server.properties file.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Editor
                        name='server.properties'
                        content={fileContent}
                        siblingFiles={[]}
                        handleClose={(setContent) => setContent(originalFileContent)}
                        server={server as string}
                        path='/'
                        ip={ip}
                        setMessage={setMessage}
                        closeText='Cancel'
                      />
                      {message && <Message message={message} setMessage={setMessage} />}
                    </>
                  )}
                </Paper>
              )
            )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default ServerProperties
