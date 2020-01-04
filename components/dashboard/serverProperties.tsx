import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, TextField, Button, Snackbar, IconButton, LinearProgress
} from '@material-ui/core'
import Close from '@material-ui/icons/Close'

import { ip } from '../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../imports/connectionFailure'

const Message = ({ message, setMessage }: { message: string, setMessage: (a: string) => void }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    open={!!message}
    autoHideDuration={5000}
    onClose={() => setMessage('')}
    ContentProps={{ 'aria-describedby': 'message-id' }}
    message={<span id='message-id'>{message}</span>}
    action={[
      <Button key='undo' color='secondary' size='small' onClick={() => setMessage('')}>
        CLOSE
      </Button>,
      <IconButton key='close' aria-label='close' color='inherit' onClick={() => setMessage('')}>
        <Close />
      </IconButton>
    ]}
  />
)

const ServerProperties = (props: { server: string }) => {
  const [listening, setListening] = useState(false)
  const [save, setSave] = useState(false)
  const [message, setMessage] = useState('')
  const [serverProperties, setServerProperties] = useState<string>(null)
  const [origContent, setOrigContent] = useState<string>(null)
  // componentDidMount
  useEffect(() => {
    (async () => {
      try {
        // Fetch server properties.
        const res = await fetch(ip + '/server/' + props.server + '/file?path=server.properties', {
          headers: { Authorization: localStorage.getItem('accessToken') }
        })
        const serverProperties = await res.text()
        if (res.status === 401) throw new Error()
        else if (res.status === 404) setListening(true)
        else if (res.ok) {
          setListening(true)
          setOrigContent(serverProperties)
          setServerProperties(serverProperties)
        }
      } catch (e) { }
    })()
  }, [props.server])

  const saveFile = async () => {
    setSave(true)
    // Save the file.
    const formData = new FormData()
    formData.append('upload', new Blob([serverProperties]), 'server.properties')
    const r = await fetch(
      `${ip}/server/${props.server}/file?path=/`,
      { method: 'POST', body: formData, headers: { Authorization: localStorage.getItem('token') } }
    )
    if (r.status !== 200) setMessage((await r.json()).error)
    else setMessage('Saved successfully!')
    setSave(false)
  }
  // Return the code.
  if (!listening) return <ConnectionFailure />
  else if (serverProperties === null || origContent === null) {
    return (
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>server.properties</Typography>
        <div style={{ paddingBottom: 10 }} />
        <Typography>Looks like this server does not have a server.properties file.</Typography>
      </Paper>
    )
  }
  return (
    <>
      {/* server.properties */}
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>server.properties</Typography>
        <div style={{ paddingBottom: 10 }} />
        <TextField multiline variant='outlined' fullWidth rowsMax={20}
          value={serverProperties}
          onChange={e => setServerProperties(e.target.value)}
        />
        <br />
        <div style={{ display: 'flex', marginTop: 10 }}>
          <Button variant='outlined' onClick={() => setServerProperties(origContent)}>Cancel</Button>
          <div style={{ flex: 1 }} />
          <Button variant='contained' color='secondary' onClick={saveFile}>Save</Button>
        </div>
        {save ? (<div style={{ paddingTop: 10 }}><LinearProgress /></div>) : ''}
      </Paper>
      <Message message={message} setMessage={setMessage} />
    </>
  )
}

export default ServerProperties
