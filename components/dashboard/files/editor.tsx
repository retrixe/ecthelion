import React, { useState } from 'react'
import { Typography, Paper, Button, TextField, LinearProgress } from '@material-ui/core'

const Editor = (props: {
  name: string,
  content: string,
  close: () => void,
  server: string,
  path: string,
  ip: string,
  setMessage: (a: string) => void
}) => {
  const [content, setContent] = useState(props.content)
  const [save, setSave] = useState(false)

  const saveFile = async () => {
    setSave(true)

    // Save the file.
    const formData = new FormData()
    formData.append('upload', new Blob([content]), props.name)
    const r = await fetch(
      `${props.ip}/server/${props.server}/file?path=${props.path}`,
      { method: 'POST', body: formData, headers: { Authorization: localStorage.getItem('token') } }
    )
    if (r.status !== 200) props.setMessage((await r.json()).error)
    else props.setMessage('Saved successfully!')
    setSave(false)
  }

  return (
    <>
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>{props.name}</Typography>
        <div style={{ paddingBottom: 10 }} />
        <TextField multiline variant='outlined' fullWidth rowsMax={20}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <br />
        <div style={{ display: 'flex', marginTop: 10 }}>
          <Button variant='outlined' onClick={props.close}>Cancel</Button>
          <div style={{ flex: 1 }} />
          <Button variant='contained' disabled={save} color='secondary' onClick={() => saveFile()}>
            Save
          </Button>
        </div>
        {save ? (<div style={{ paddingTop: 10 }}><LinearProgress /></div>) : ''}
      </Paper>
      <div style={{ padding: 10 }} />
    </>
  )
}

export default Editor
