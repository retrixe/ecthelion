import React from 'react'
import { useRouter } from 'next/router'
import {
  ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Avatar, Tooltip, IconButton
} from '@mui/material'

import Storage from '@mui/icons-material/Storage'
import Stop from '@mui/icons-material/Stop'
import Close from '@mui/icons-material/Close'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Comment from '@mui/icons-material/Comment'

export const ServerListItem = ({ name, status, openDialog, stopStartServer }: {
  name: string,
  status: number,
  openDialog: () => void,
  stopStartServer: (operation: string, server: string) => void
}) => {
  const router = useRouter()
  router.prefetch('/dashboard/[server]/console') // Ensure it is prefetched for fast load times.
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    router.push('/dashboard/[server]/console', `/dashboard/${name}/console`)
  }
  return (
    <ListItem dense button component='a' href={`/dashboard/${name}/console`} onClick={onClick}>
      <ListItemAvatar><Avatar><Storage /></Avatar></ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={status === 0 ? 'Offline' : (status === 1 ? 'Online' : 'Crashed')}
      />
      <ListItemSecondaryAction>
        {/* Former color scheme: primary/(default, secondary, primary) */}
        <Tooltip title={status !== 1 ? 'Start' : 'Stop'}>
          <IconButton
            aria-label={status !== 1 ? 'start' : 'stop'}
            onClick={() => (stopStartServer(status !== 1 ? 'start' : 'stop', name))}
            color='default'
          >
            {status !== 1 ? <PlayArrow /> : <Stop />}
          </IconButton>
        </Tooltip>
        {status === 1 && (
          <Tooltip title='Kill'>
            <IconButton
              aria-label='kill'
              onClick={() => (stopStartServer('kill', name))}
              color='primary'
            >
              <Close />
            </IconButton>
          </Tooltip>
        )}
        {status === 1 && (
          <Tooltip title='Run Command'>
            <IconButton aria-label='run command' color='secondary' onClick={() => openDialog()}>
              <Comment />
            </IconButton>
          </Tooltip>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default ServerListItem
