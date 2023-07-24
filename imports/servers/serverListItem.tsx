import React from 'react'
import { useRouter } from 'next/router'
import {
  ListItem, ListItemAvatar, ListItemButton, ListItemText, Avatar, Tooltip, IconButton
} from '@mui/material'

import Storage from '@mui/icons-material/Storage'
import Stop from '@mui/icons-material/Stop'
import Close from '@mui/icons-material/Close'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Comment from '@mui/icons-material/Comment'
import UnstyledLink from '../helpers/unstyledLink'

export const ServerListItem = ({ server, node, status, openDialog, stopStartServer }: {
  node?: string
  server: string
  status: number
  openDialog: () => void
  stopStartServer: (operation: 'START' | 'TERM' | 'KILL', server: string) => void
}): JSX.Element => {
  const router = useRouter()
  const href = { pathname: '/dashboard/[server]/console', query: node ? { server, node } : { server } }
  return (
    <UnstyledLink href={href} onClick={e => e.preventDefault()}>
      <ListItem
        disablePadding
        secondaryAction={
          <>
            {/* Former color scheme: primary/(default, secondary, primary) */}
            <Tooltip title={status !== 1 ? 'Start' : 'Stop'}>
              <IconButton
                aria-label={status !== 1 ? 'start' : 'stop'}
                onClick={() => (stopStartServer(status !== 1 ? 'START' : 'TERM', server))}
                color='default'
              >
                {status !== 1 ? <PlayArrow /> : <Stop />}
              </IconButton>
            </Tooltip>
            {status === 1 && (
              <Tooltip title='Kill'>
                <IconButton
                  aria-label='kill'
                  onClick={() => (stopStartServer('KILL', server))}
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
          </>
        }
      >
        <ListItemButton dense onClick={() => { router.push(href).catch(console.error) }}>
          <ListItemAvatar>
            <Avatar>
              <Storage />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={server}
            secondary={status === 0 ? 'Offline' : (status === 1 ? 'Online' : 'Crashed')}
          />
        </ListItemButton>
      </ListItem>
    </UnstyledLink>
  )
}

export default ServerListItem
