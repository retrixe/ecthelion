import React, { useState } from 'react'
import { Typography, Button, TextField, LinearProgress, IconButton, Tooltip } from '@mui/material'
import GetApp from '@mui/icons-material/GetApp'

// TODO: Refresh button.
const Editor = (props: {
  name: string,
  content: string,
  siblingFiles: string[],
  handleClose: (setContent: React.Dispatch<React.SetStateAction<string>>) => void,
  server: string,
  path: string,
  ip: string,
  setMessage: (message: string) => void,
  closeText?: string
}) => {
  const [content, setContent] = useState(props.content)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(props.name)
  const error = props.name === '' && props.siblingFiles.includes(name)

  const saveFile = async () => {
    setSaving(true)
    // Save the file.
    const formData = new FormData()
    formData.append('upload', new Blob([content]), `${props.path}${name}`)
    const token = localStorage.getItem('token')
    if (!token) return
    const r = await fetch(
      `${props.ip}/server/${props.server}/file`,
      { method: 'POST', body: formData, headers: { Authorization: token } }
    )
    if (r.status !== 200) props.setMessage((await r.json()).error)
    else props.setMessage('Saved successfully!')
    setSaving(false)
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        {props.name
          ? <Typography variant='h5' gutterBottom>{name}</Typography>
          : (
            <TextField
              size='small'
              value={name}
              error={error}
              label='Filename'
              variant='outlined'
              onChange={e => setName(e.target.value)}
              helperText={error
                ? 'This file already exists! Go back and open the file directly or delete it.'
                : undefined}
            />
            )}
        <div style={{ flex: 1 }} />
        {props.name && (
          <Tooltip title='Download'>
            <IconButton
              onClick={async () => {
                const ticket = await fetch(props.ip + '/ott', {
                  headers: { authorization: localStorage.getItem('token') || '' }
                })
                const ott = encodeURIComponent((await ticket.json()).ticket)
                window.location.href = `${props.ip}/server/${props.server}/file?path=${props.path}${name}&ticket=${ott}`
              }}
            >
              <GetApp />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div style={{ paddingBottom: 10 }} />
      <TextField
        multiline
        variant='outlined'
        fullWidth
        maxRows={30}
        value={content}
        InputProps={{ style: { fontFamily: 'monospace', fontSize: '14px' } }}
        onChange={e => setContent(e.target.value)}
      />
      <br />
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Button variant='outlined' onClick={() => props.handleClose(setContent)}>
          {props.closeText || 'Close'}
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving || error} color='secondary' onClick={saveFile}>
          Save
        </Button>
      </div>
      {saving && (<div style={{ paddingTop: 10 }}><LinearProgress /></div>)}
    </>
  )
}

export default Editor
