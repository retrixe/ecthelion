import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@material-ui/core'

const FolderCreationDialog = ({ handleClose, setFetching, setMessage, ip, server, reload }: {
  handleClose: () => void,
  reload: () => void,
  setFetching: (fetching: boolean) => void,
  setMessage: (message: string) => void,
  ip: string,
  server: string
}) => {
  const [name, setName] = useState('')
  const handleCreateFolder = async () => {
    setFetching(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('Missing token in localStorage!')
        return
      }
      const createFolder = await (await fetch(
        `${ip}/server/${server}/folder?path=/${name}`,
        { headers: { Authorization: token }, method: 'POST' }
      )).json()
      if (createFolder.success) {
        reload()
        handleClose()
      } else {
        setMessage(createFolder.error)
        setFetching(false)
      }
    } catch (e) {
      setMessage(e)
      setFetching(false)
    }
  }
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter name of the new folder:</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='Folder Name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleCreateFolder} color='primary'>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FolderCreationDialog
