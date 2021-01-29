import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@material-ui/core'

const MassActionDialog = ({ operation, reload, files, endpoint, handleClose, path, setOverlay, setMessage }: {
  reload: () => void,
  operation: 'move' | 'copy',
  setOverlay: (message: string) => void,
  setMessage: (message: string) => void,
  handleClose: () => void,
  endpoint: string,
  files: string[],
  path: string
}) => {
  const [newPath, setNewPath] = useState('')
  const move = operation === 'move' ? 'Move' : 'Copy'
  const moved = operation === 'move' ? 'Moved' : 'Copied'
  const moving = operation === 'move' ? 'moving' : 'copying'
  const handleOperation = () => {
    handleClose()
    let left = files.length
    setOverlay(`${moving} ${left} out of ${files.length} files.`)
    const operations = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // setOverlay(file)
      const token = localStorage.getItem('token')
      if (!token) return
      const slash = newPath.endsWith('/') ? '' : '/'
      const body = `${operation === 'move' ? 'mv' : 'cp'}\n${path}${file}\n${newPath}${slash}${file}`
      operations.push(fetch(
        `${endpoint}?path=${encodeURIComponent(path + file)}`,
        { method: 'PATCH', body, headers: { Authorization: token } }
      ).then(async r => {
        if (r.status !== 200) setMessage(`Error ${moving} ${file}\n${(await r.json()).error}`)
        setOverlay(`${moving} ${--left} out of ${files.length} files.`)
        if (localStorage.getItem('logAsyncMassActions')) console.log(moved + ' ' + file)
      }))
    }
    Promise.allSettled(operations).then(() => {
      reload()
      setOverlay('')
      setMessage(moved + ' all files successfully!')
    })
  }
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{move} Files (WIP)</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter path of folder to {operation} to:</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='New Path'
            value={newPath}
            onChange={e => setNewPath(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleOperation() } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleOperation} color='primary'>{move}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MassActionDialog
