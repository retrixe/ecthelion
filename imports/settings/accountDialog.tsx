import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@mui/material'

const AccountDialog = (props: {
  onSubmit: (username: string, password: string) => void
  onClose: () => void
  username?: string
  open: boolean
}) => {
  const changePassword = typeof props.username === 'string'
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordRef = React.useRef<HTMLInputElement>(null)
  const confirmRef = React.useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setError('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    props.onClose()
  }

  const handleSubmit = () => {
    if (!username && !changePassword) setError('Username is required!')
    else if (!password) setError('Password is required!')
    else if (password !== confirmPassword) setError('Passwords do not match!')
    else {
      setError('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      props.onSubmit(props.username ?? username, password)
    }
  }

  return (
    <>
      <Dialog open={props.open} onClose={handleClose}>
        <DialogTitle>{changePassword ? 'Change Password' : 'Create Account'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {changePassword
              ? `Enter new password for ${props.username}:`
              : 'Enter username and password:'}
          </DialogContentText>
          {!changePassword && (
            <TextField
              autoFocus
              fullWidth
              color={error ? 'error' : undefined}
              margin='normal'
              label='Username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { passwordRef.current?.focus() } }}
            />
          )}
          <TextField
            fullWidth
            color={error ? 'error' : undefined}
            inputRef={passwordRef}
            margin='normal'
            label='Password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmRef.current?.focus() }}
          />
          <TextField
            fullWidth
            color={error ? 'error' : undefined}
            inputRef={confirmRef}
            margin='normal'
            label='Confirm Password'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          />
          {error && <DialogContentText color='error'>{error}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleSubmit} color='primary'>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AccountDialog
