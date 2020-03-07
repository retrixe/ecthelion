import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@material-ui/core'

const MassActionDialog = ({ operation, files, endpoint, handleClose, path, setOverlay, setMessage }: {
  operation: 'move' | 'copy',
  setOverlay: (message: string) => void,
  setMessage: (message: string) => void,
  handleClose: () => void,
  endpoint: string,
  files: string[],
  path: string
}) => {
  // TODO: Wait for stable endpoint on server.
  const [newPath, setNewPath] = useState('')
  const handleOperation = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setOverlay(file)
      const token = localStorage.getItem('token')
      if (!token) return
      const body = operation === 'move'
        ? `mv\n${path}${file}\n${newPath}/${file}`
        : `cp\n${path}${file}\n${newPath}/${file}`
      const r = await fetch(
        `${endpoint}?path=${path}${file}`,
        { method: 'PATCH', body, headers: { Authorization: token } }
      )
      if (r.status !== 200) setMessage(`Error ${operation}ing ${file}\n${(await r.json()).error}`)
      setOverlay('')
    }
    setMessage(operation + 'd all files successfully!')
  }
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{operation} Files</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter new path:</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='New Path'
            value={newPath}
            onChange={e => setNewPath(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleOperation} color='primary'>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MassActionDialog
