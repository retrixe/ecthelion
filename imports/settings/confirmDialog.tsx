import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material'

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
        <Button onClick={() => props.onCancel()} color='secondary'>Cancel</Button>
        <Button onClick={() => props.onConfirm()} color='primary'>Confirm</Button>
      </DialogActions>
    </Dialog>
  </>
)

export default ConfirmDialog
