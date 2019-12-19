import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import { Paper, Typography, TextField, LinearProgress, Button } from '@material-ui/core'

import Title from '../../../imports/helpers/title'
import Message from '../../../imports/helpers/message'
import AuthFailure from '../../../imports/errors/authFailure'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

/*
  TODO:
  Move the editor out and add a button to refresh contents from the server
  as this shares a lot in common with files tab.
*/

const ServerProperties = () => {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [originalFileContent, setOriginalFileContent] = useState('')
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
    (async () => {
      try {
        // Fetch server properties.
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch(
          `${serverIp}/server/${router.query.server}/file?path=server.properties`,
          { headers: { Authorization: token } }
        )
        const serverProperties = await res.text()
        if (res.status === 401) throw new Error()
        else if (res.status === 404) setListening(true)
        else if (res.ok) {
          setListening(true)
          setOriginalFileContent(serverProperties)
          setFileContent(serverProperties)
        }
      } catch (e) { }
    })()
  }, [serverIp, router.query.server])

  const saveFile = async () => { // TODO: Wait for stable endpoint on server.
    setSaving(true)
    // Save the file.
    const formData = new FormData()
    formData.append('upload', new Blob([fileContent]), 'server.properties')
    const token = localStorage.getItem('token')
    if (!token) return
    const r = await fetch(
      `${serverIp}/server/${router.query.server}/file?path=/`,
      { method: 'POST', body: formData, headers: { Authorization: token } }
    )
    if (r.status !== 200) setMessage((await r.json()).error)
    else setMessage('Saved successfully!')
    setSaving(false)
  }

  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='server.properties - Ecthelion'
        description='The server.properties of a Minecraft server running on Octyne.'
        url={`/dashboard/${router.query.server}/properties`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!authenticated ? <AuthFailure /> : (
            !listening ? <ConnectionFailure /> : (
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
                    {/* server.properties */}
                    <Typography variant='h5' gutterBottom>server.properties</Typography>
                    <div style={{ paddingBottom: 10 }} />
                    <TextField
                      multiline
                      variant='outlined'
                      fullWidth
                      rowsMax={20}
                      value={fileContent}
                      onChange={e => setFileContent(e.target.value)}
                    />
                    <br />
                    <div style={{ display: 'flex', marginTop: 10 }}>
                      <Button
                        variant='outlined'
                        onClick={() => setFileContent(originalFileContent)}
                      >
                        Cancel
                      </Button>
                      <div style={{ flex: 1 }} />
                      <Button variant='contained' color='secondary' onClick={saveFile}>Save</Button>
                    </div>
                    {saving && (<div style={{ paddingTop: 10 }}><LinearProgress /></div>)}
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
