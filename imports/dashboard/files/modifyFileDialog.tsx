import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@mui/material'

const ModifyFileDialog = ({ handleEdit, handleClose, operation, filename }: {
  handleEdit: (path: string) => any
  handleClose: () => void
  operation: 'move'|'copy'|'rename'
  filename: string
}) => {
  const [path, setPath] = useState(operation === 'rename' ? filename : '')
  const title = operation === 'copy'
    ? 'Copy File/Folder'
    : operation === 'move' ? 'Move File/Folder' : 'Rename File/Folder'
  const pathOrName = operation === 'rename' ? 'name' : 'path'
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter new {pathOrName}:</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='normal'
            label={`New ${pathOrName}`}
            value={path}
            onChange={e => setPath(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEdit(path) } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={() => handleEdit(path)} color='primary'>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ModifyFileDialog
