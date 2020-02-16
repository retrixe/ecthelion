import React, { useState } from 'react'
import { Typography, Button, TextField, LinearProgress, IconButton, Tooltip } from '@material-ui/core'
import GetApp from '@material-ui/icons/GetApp'

const Editor = (props: {
  name: string,
  content: string,
  handleClose: () => void,
  server: string,
  path: string,
  ip: string,
  setMessage: (message: string) => void
}) => {
  const [content, setContent] = useState(props.content)
  const [saving, setSaving] = useState(false)

  const saveFile = async () => {
    setSaving(true)
    // Save the file.
    const formData = new FormData()
    formData.append('upload', new Blob([content]), `${props.path}${props.name}`)
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
        <Typography variant='h5' gutterBottom>{props.name}</Typography>
        <div style={{ flex: 1 }} />
        <Tooltip title='Download'>
          <IconButton
            onClick={() => {
              window.location.href = `${props.ip}/server/${props.server}/file?path=${props.path}${props.name}`
            }}
          >
            <GetApp />
          </IconButton>
        </Tooltip>
      </div>
      <div style={{ paddingBottom: 10 }} />
      <TextField
        multiline
        variant='outlined'
        fullWidth
        rowsMax={20}
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <br />
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Button variant='outlined' onClick={props.handleClose}>Cancel</Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving} color='secondary' onClick={saveFile}>
          Save
        </Button>
      </div>
      {saving && (<div style={{ paddingTop: 10 }}><LinearProgress /></div>)}
    </>
  )
}

export default Editor
