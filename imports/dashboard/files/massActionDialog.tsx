import React, { useState } from 'react'
import { type KyInstance } from 'ky/distribution/types/ky'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@mui/material'

const MassActionDialog = ({
  operation, reload, files, endpoint, ky, handleClose, path, setOverlay, setMessage
}: {
  reload: () => void
  operation: 'move' | 'copy' | 'compress'
  setOverlay: (message: string | { text: string, progress: number }) => void
  setMessage: (message: string) => void
  handleClose: () => void
  endpoint: string
  files: string[]
  path: string
  ky: KyInstance
}): JSX.Element => {
  const [newPath, setNewPath] = useState('')
  const move = operation === 'move' ? 'Move' : operation === 'compress' ? 'Compress' : 'Copy'
  const moved = operation === 'move' ? 'Moved' : operation === 'compress' ? 'Compressed' : 'Copied'
  const moving = operation === 'move' ? 'Moving' : operation === 'compress' ? 'Compressing ' : 'Copying'
  const movingl = operation === 'move' ? 'moving' : operation === 'compress' ? 'compressing ' : 'copying'
  const handleOperation = (): void => {
    handleClose()
    if (operation === 'compress') {
      setOverlay(`Compressing ${files.length} files on the server.`)
      const json = files.map(f => path + f)
      ky.post(`${endpoint}?path=${encodeURIComponent(path + newPath + '.zip')}`, { json }).then(res => {
        setOverlay('')
        if (res.ok) {
          reload()
          setMessage('Compressed all files successfully!')
        } else setMessage('Failed to compress the files!')
      }).catch(() => setMessage('Failed to compress the files!'))
      return
    }
    let left = files.length
    setOverlay({ text: `${moving} ${left} out of ${files.length} files.`, progress: 0 })
    const operations = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // setOverlay(file)
      const slash = newPath.endsWith('/') ? '' : '/'
      const body = `${operation === 'move' ? 'mv' : 'cp'}\n${path}${file}\n${newPath}${slash}${file}`
      operations.push(ky.patch(`${endpoint}?path=${encodeURIComponent(path + file)}`, { body })
        .then(async r => {
          if (r.status !== 200) {
            setMessage(`Error ${movingl} ${file}\n${(await r.json<{ error: string }>()).error}`)
          }
          const progress = (files.length - left) * 100 / files.length
          setOverlay({ text: `${moving} ${--left} out of ${files.length} files.`, progress })
          if (localStorage.getItem('logAsyncMassActions')) console.log(moved + ' ' + file)
        })
        .catch(e => setMessage(`Error ${movingl} ${file}\n${e}`)))
    }
    Promise.allSettled(operations).then(() => {
      reload()
      setOverlay('')
      setMessage(moved + ' all files successfully!')
    }).catch(console.error) // Should not be called, ideally.
  }
  const prompt = operation === 'compress'
    ? 'Enter path to archive to create:'
    : `Enter path of folder to ${operation} to:`
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{move} Files</DialogTitle>
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
