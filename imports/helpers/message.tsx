import React from 'react'
import { Snackbar, Button, IconButton } from '@mui/material'
import Close from '@mui/icons-material/Close'

const Message = ({
  message,
  setMessage,
}: {
  message: string
  setMessage: (a: string) => void
}): React.JSX.Element => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    open={!!message}
    autoHideDuration={5000}
    onClose={() => setMessage('')}
    ContentProps={{ 'aria-describedby': 'message-id' }}
    message={<span id='message-id'>{message}</span>}
    action={[
      <Button key='undo' color='secondary' size='small' onClick={() => setMessage('')}>
        CLOSE
      </Button>,
      <IconButton key='close' aria-label='close' color='inherit' onClick={() => setMessage('')}>
        <Close />
      </IconButton>,
    ]}
  />
)

export default Message
