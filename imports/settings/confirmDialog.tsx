import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React from 'react'

const ConfirmDialog = (props: {
  onConfirm: () => void
  onCancel: () => void
  open: boolean
  title: string
  prompt: string
}): React.JSX.Element => (
  <>
    <Dialog open={props.open} onClose={() => props.onCancel()}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.prompt}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onCancel()} color='secondary'>
          Cancel
        </Button>
        <Button onClick={() => props.onConfirm()}>Confirm</Button>
      </DialogActions>
    </Dialog>
  </>
)

export default ConfirmDialog
