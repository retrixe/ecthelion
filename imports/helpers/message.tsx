import Close from '@mui/icons-material/Close'
import { Button, IconButton, Snackbar } from '@mui/material'
import React from 'react'

const Message = ({
  message,
  setMessage,
}: {
  message: string
  setMessage: (a: string) => void
}): React.JSX.Element => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    open={!!message}
    autoHideDuration={5000}
    onClose={() => setMessage('')}
    slotProps={{ content: { 'aria-describedby': 'message-id' } }}
    message={<span id='message-id'>{message}</span>}
    action={[
      <Button key='undo' size='small' onClick={() => setMessage('')}>
        CLOSE
      </Button>,
      <IconButton key='close' aria-label='close' color='inherit' onClick={() => setMessage('')}>
        <Close />
      </IconButton>,
    ]}
  />
)

export default Message
