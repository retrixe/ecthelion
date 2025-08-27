import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import React, { useState } from 'react'

const FolderCreationDialog = ({
  handleCreateFolder,
  handleClose,
}: {
  handleCreateFolder: (name: string) => void
  handleClose: () => void
}): React.JSX.Element => {
  const [name, setName] = useState('')
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
            margin='normal'
            label='Folder Name'
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder(name)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={() => handleCreateFolder(name)}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FolderCreationDialog
