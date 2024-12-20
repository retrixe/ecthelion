import React, { useEffect, useState } from 'react'
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Add from '@mui/icons-material/Add'
import DeleteForever from '@mui/icons-material/DeleteForever'
import DriveFileRenameOutline from '@mui/icons-material/DriveFileRenameOutline'
import LockReset from '@mui/icons-material/LockReset'

import AuthFailure from '../../imports/errors/authFailure'
import SettingsLayout from '../../imports/settings/settingsLayout'
import ConnectionFailure from '../../imports/errors/connectionFailure'
import useKy from '../../imports/helpers/useKy'
import Title from '../../imports/helpers/title'
import Message from '../../imports/helpers/message'
import AccountDialog from '../../imports/settings/accountDialog'

const AccountsPage = (): React.JSX.Element => {
  const ky = useKy()
  const [status, setStatus] = useState<'failure' | 'unsupported' | 'not logged in' | null>(null)
  const [accounts, setAccounts] = useState<string[] | null>(null)

  const [message, setMessage] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [deleteAccount, setDeleteAccount] = useState('')
  const [renameAccount, setRenameAccount] = useState('')
  const [changePassword, setChangePassword] = useState('')

  const refetch = (): void => {
    ky.get('accounts')
      .then(async res => {
        if (res.ok) return await res.json()
        else if (res.status === 401) setStatus('not logged in')
        else if (res.status === 404) setStatus('unsupported')
        else setStatus('failure')
      })
      .then(data => {
        if (Array.isArray(data))
          setAccounts(data.sort((a: string, b: string) => a.localeCompare(b)))
      })
      .catch(() => setStatus('failure'))
  }

  useEffect(refetch, [ky])

  const handleCreateAccount = (username: string, password: string): void => {
    ;(async () => {
      const res = await ky.post('accounts', { json: { username, password } })
      if (res.ok) {
        refetch()
        setMessage('Account created successfully!')
      } else {
        const json = await res.json<{ error: string }>()
        setMessage(typeof json.error === 'string' ? json.error : 'Failed to create account!')
      }
      setCreateAccount(false)
    })().catch(e => {
      console.error(e)
      setMessage('Failed to create account!')
      setCreateAccount(false)
    })
  }

  const handleRenameAccount = (username: string, newName: string): void => {
    ;(async () => {
      const res = await ky.patch('accounts?username=' + encodeURIComponent(username), {
        json: { username: newName },
      })
      if (res.ok) {
        refetch()
        setMessage('Account renamed successfully!')
      } else {
        const json = await res.json<{ error: string }>()
        if (json.error === 'Username or password not provided!') {
          setMessage('Update to Octyne v1.2+ to rename accounts!')
        } else setMessage(typeof json.error === 'string' ? json.error : 'Failed to rename account!')
      }
      setRenameAccount('')
    })().catch(e => {
      console.error(e)
      setMessage('Failed to rename account!')
      setRenameAccount('')
    })
  }

  const handleChangePassword = (username: string, password: string): void => {
    ;(async () => {
      const res = await ky.patch('accounts', { json: { username, password } })
      if (res.ok) {
        refetch()
        setMessage('Password changed successfully!')
      } else {
        const json = await res.json<{ error: string }>()
        setMessage(typeof json.error === 'string' ? json.error : 'Failed to change password!')
      }
      setChangePassword('')
    })().catch(e => {
      console.error(e)
      setMessage('Failed to change password!')
      setChangePassword('')
    })
  }

  const handleDeleteAccount = (): void => {
    ;(async () => {
      const res = await ky.delete('accounts?username=' + encodeURIComponent(deleteAccount))
      if (res.ok) {
        refetch()
        setMessage('Account deleted successfully!')
      } else {
        const json = await res.json<{ error: string }>()
        setMessage(typeof json.error === 'string' ? json.error : 'Failed to delete account!')
      }
      setDeleteAccount('')
    })().catch(e => {
      console.error(e)
      setMessage('Failed to delete account!')
      setDeleteAccount('')
    })
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
              <Typography variant='h5' style={{ flex: 1 }}>
                Manage Accounts
              </Typography>
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
                      <Tooltip title='Rename Account'>
                        <IconButton onClick={() => setRenameAccount(account)}>
                          <DriveFileRenameOutline />
                        </IconButton>
                      </Tooltip>
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
            <Button
              key='close'
              size='small'
              aria-label='close'
              color='inherit'
              onClick={() => setDeleteAccount('')}
            >
              Close
            </Button>,
            <Button key='confirm' size='small' color='primary' onClick={handleDeleteAccount}>
              Confirm
            </Button>,
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
        <AccountDialog
          open={!!renameAccount}
          onClose={() => setRenameAccount('')}
          onSubmit={handleRenameAccount}
          username={renameAccount}
          rename
        />
      </SettingsLayout>
    </React.StrictMode>
  )
}

export default AccountsPage
