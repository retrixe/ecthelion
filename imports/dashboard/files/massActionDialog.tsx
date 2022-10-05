import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@mui/material'

const MassActionDialog = ({
  operation, reload, files, endpoint, handleClose, path, setOverlay, setMessage
}: {
  reload: () => void
  operation: 'move' | 'copy' | 'compress'
  setOverlay: (message: string) => void
  setMessage: (message: string) => void
  handleClose: () => void
  endpoint: string
  files: string[]
  path: string
}) => {
  const [newPath, setNewPath] = useState('')
  const move = operation === 'move' ? 'Move' : operation === 'compress' ? 'Compress' : 'Copy'
  const moved = operation === 'move' ? 'Moved' : operation === 'compress' ? 'Compressed' : 'Copied'
  const moving = operation === 'move' ? 'Moving' : operation === 'compress' ? 'Compressing ' : 'Copying'
  const movingl = operation === 'move' ? 'moving' : operation === 'compress' ? 'compressing ' : 'copying'
  const handleOperation = () => {
    handleClose()
    if (operation === 'compress') {
      setOverlay(`Compressing ${files.length} files on the server.`)
      const authorization = localStorage.getItem('token')
      if (!authorization) return
      fetch(
        `${endpoint}?path=${encodeURIComponent(path + newPath)}`,
        { method: 'POST', body: JSON.stringify(files.map(f => path + f)), headers: { authorization } }
      ).then(res => {
        setOverlay('')
        if (res.ok) {
          reload()
          setMessage('Compressed all files successfully!')
        } else setMessage('Failed to compress the files!')
      }).catch(() => setMessage('Failed to compress the files!'))
      return
    }
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
        if (r.status !== 200) setMessage(`Error ${movingl} ${file}\n${(await r.json()).error}`)
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
  const prompt = operation === 'compress'
    ? 'Enter path to ZIP file to create:'
    : `Enter path of folder to ${operation} to:`
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{move} Files (WIP)</DialogTitle>
        <DialogContent>
          <DialogContentText>{prompt}</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='normal'
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
