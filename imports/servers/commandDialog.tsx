import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material'

const CommandDialog = ({ server, handleClose, runCommand }: {
  server: string,
  handleClose: () => void,
  runCommand: (command: string) => void
}) => {
  const [command, setCommand] = useState('')
  return (
    <Dialog open fullWidth onClose={handleClose}>
      <DialogTitle>Run Command on {server}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='command'
          label='Command'
          value={command}
          onChange={e => setCommand(e.target.value)}
          onSubmit={() => runCommand(command)}
          onKeyDown={e => e.key === 'Enter' && runCommand(command)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => runCommand(command)} color='primary'>Run</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommandDialog
