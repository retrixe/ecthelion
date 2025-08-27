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

const CommandDialog = ({
  server,
  handleClose,
  runCommand,
}: {
  server: string
  handleClose: () => void
  runCommand: (command: string) => void
}): React.JSX.Element => {
  const [command, setCommand] = useState('')
  return (
    <Dialog open fullWidth onClose={handleClose}>
      <DialogTitle>Run Command on {server}</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter the input to send to process:</DialogContentText>
        <TextField
          autoFocus
          id='command'
          label='Command'
          margin='normal'
          value={command}
          onChange={e => setCommand(e.target.value)}
          onSubmit={() => runCommand(command)}
          onKeyDown={e => e.key === 'Enter' && runCommand(command)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          Cancel
        </Button>
        <Button onClick={() => runCommand(command)}>Run</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommandDialog
