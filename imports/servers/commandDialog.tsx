import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'

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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => runCommand(command)} color='primary'>
          Run
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommandDialog
