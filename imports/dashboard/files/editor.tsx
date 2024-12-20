import React, { useState } from 'react'
import { Typography, Button, TextField, LinearProgress, IconButton, Tooltip } from '@mui/material'
import GetApp from '@mui/icons-material/GetApp'

// TODO: Refresh button.
const Editor = (props: {
  name: string
  content: string
  siblingFiles: string[]
  onSave: (name: string, content: string) => Promise<void> | void
  onDownload: () => void
  onClose: (setContent: React.Dispatch<React.SetStateAction<string>>) => void
  closeText?: string
}): React.JSX.Element => {
  const [content, setContent] = useState(props.content)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(props.name)
  const error = props.name === '' && props.siblingFiles.includes(name)

  const saveFile = (): void => {
    setSaving(true)
    Promise.resolve(props.onSave(name, content))
      .then(() => setSaving(false))
      .catch(console.error)
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        {props.name ? (
          <Typography variant='h5' gutterBottom>
            {name}
          </Typography>
        ) : (
          <TextField
            size='small'
            value={name}
            error={error}
            label='Filename'
            variant='outlined'
            onChange={e => setName(e.target.value)}
            helperText={
              error
                ? 'This file already exists! Go back and open the file directly or delete it.'
                : undefined
            }
          />
        )}
        <div style={{ flex: 1 }} />
        {props.name && (
          <Tooltip title='Download'>
            <IconButton onClick={props.onDownload}>
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
        slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: '14px' } } }}
        onChange={e => setContent(e.target.value)}
      />
      <br />
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Button variant='outlined' onClick={() => props.onClose(setContent)}>
          {props.closeText ?? 'Close'}
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving || error} color='secondary' onClick={saveFile}>
          Save
        </Button>
      </div>
      {saving && (
        <div style={{ paddingTop: 10 }}>
          <LinearProgress color='secondary' />
        </div>
      )}
    </>
  )
}

export default Editor
