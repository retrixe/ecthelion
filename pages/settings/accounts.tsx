import React, { useEffect, useState } from 'react'
import { Button, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Snackbar, Tooltip, Typography } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Add from '@mui/icons-material/Add'
import DeleteForever from '@mui/icons-material/DeleteForever'
import LockReset from '@mui/icons-material/LockReset'

import AuthFailure from '../../imports/errors/authFailure'
import SettingsLayout from '../../imports/settings/settingsLayout'
import ConnectionFailure from '../../imports/errors/connectionFailure'
import useKy from '../../imports/helpers/useKy'
import Title from '../../imports/helpers/title'
import Message from '../../imports/helpers/message'
import AccountDialog from '../../imports/settings/accountDialog'

const AccountsPage = () => {
  const ky = useKy()
  const [status, setStatus] = useState<'failure' | 'unsupported' | 'not logged in' | null>(null)
  const [accounts, setAccounts] = useState<string[] | null>(null)

  const [message, setMessage] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [deleteAccount, setDeleteAccount] = useState('')
  const [changePassword, setChangePassword] = useState('')

  const refetch = () => {
    ky.get('accounts').then(async res => {
      if (res.ok) return await res.json()
      else if (res.status === 401) setStatus('not logged in')
      else if (res.status === 404) setStatus('unsupported')
      else setStatus('failure')
    }).then(data => {
      if (Array.isArray(data)) setAccounts(data.sort((a: string, b: string) => a.localeCompare(b)))
    }).catch(() => setStatus('failure'))
  }

  useEffect(refetch, [ky])

  const handleCreateAccount = (username: string, password: string) => {
    ky.post('accounts', { json: { username, password } }).then(res => {
      if (res.ok) {
        refetch()
        setMessage('Account created successfully!')
      } else setMessage('Failed to create account!')
      setCreateAccount(false)
    }).catch(() => setMessage('Failed to create account!'))
  }

  const handleChangePassword = (username: string, password: string) => {
    ky.patch('accounts', { json: { username, password } }).then(res => {
      if (res.ok) {
        refetch()
        setMessage('Password changed successfully!')
      } else setMessage('Failed to change password!')
      setChangePassword('')
    }).catch(() => setMessage('Failed to change password!'))
  }

  const handleDeleteAccount = () => {
    ky.delete('accounts?username=' + encodeURIComponent(deleteAccount)).then(res => {
      if (res.ok) {
        refetch()
        setMessage('Account deleted successfully!')
      } else setMessage('Failed to delete account!')
      setDeleteAccount('')
    }).catch(() => setMessage('Failed to delete account!'))
  }

  return (
    <React.StrictMode>
      <Title
        title='Accounts - Ecthelion'
        description='Manage Octyne accounts from here.'
        url='/accounts'
      />
      <SettingsLayout loggedIn={status !== 'not logged in'}>
        {status === 'not logged in' && <AuthFailure />}
        {status === 'failure' && <ConnectionFailure loading={false} />}
        {status === 'unsupported' && (
          <Paper style={{ padding: 10 }}>
            <Typography>This feature requires Octyne 1.1 or newer!</Typography>
            <a
              href='https://github.com/retrixe/octyne/releases'
              style={{ textDecoration: 'underline', color: 'inherit' }}
            >
              <Typography>Update Octyne to be able to manage accounts from Ecthelion.</Typography>
            </a>
          </Paper>
        )}
        {status === null && accounts === null && <ConnectionFailure loading />}
        {status === null && accounts !== null && (
          <Paper style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h5' style={{ flex: 1 }}>Manage Accounts</Typography>
              <Tooltip title='Create Account'>
                <IconButton onClick={() => setCreateAccount(true)}>
                  <Add />
                </IconButton>
              </Tooltip>
            </div>
            <List>
              {accounts.map(account => (
                <ListItem
                  key={account}
                  divider
                  secondaryAction={
                    <>
                      <Tooltip title='Change Password'>
                        <IconButton onClick={() => setChangePassword(account)}>
                          <LockReset />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => setDeleteAccount(account)} edge='end'>
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary={account} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        <Message message={message} setMessage={setMessage} />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={!!deleteAccount}
          autoHideDuration={5000}
          onClose={() => setDeleteAccount('')}
          message={`Are you sure you want to delete account '${deleteAccount}'?`}
          action={[
            <Button key='close' size='small' aria-label='close' color='inherit' onClick={() => setDeleteAccount('')}>
              Close
            </Button>,
            <Button key='confirm' size='small' color='primary' onClick={handleDeleteAccount}>
              Confirm
            </Button>
          ]}
        />
        <AccountDialog
          open={!!createAccount}
          onClose={() => setCreateAccount(false)}
          onSubmit={handleCreateAccount}
        />
        <AccountDialog
          open={!!changePassword}
          onClose={() => setChangePassword('')}
          onSubmit={handleChangePassword}
          username={changePassword}
        />
      </SettingsLayout>
    </React.StrictMode>
  )
}

export default AccountsPage
