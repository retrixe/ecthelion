import Close from '@mui/icons-material/Close'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Stop from '@mui/icons-material/Stop'

import Storage from '@mui/icons-material/Storage'
import Terminal from '@mui/icons-material/Terminal'
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material'
import { useRouter } from 'next/router'
import React from 'react'
import UnstyledLink from '../helpers/unstyledLink'
import type { ExtraServerInfo } from './serverList'

export const ServerListItem = ({
  server,
  node,
  serverInfo,
  openDialog,
  stopStartServer,
}: {
  node?: string
  server: string
  serverInfo: number | ExtraServerInfo
  openDialog: () => void
  stopStartServer: (operation: 'START' | 'TERM' | 'KILL', server: string) => void
}): React.JSX.Element => {
  const router = useRouter()
  const href = {
    pathname: '/dashboard/[server]/console',
    query: node ? { server, node } : { server },
  }

  const status = typeof serverInfo === 'number' ? serverInfo : serverInfo.status
  const toDelete = typeof serverInfo === 'number' ? false : serverInfo.toDelete
  let statusText = status === 0 ? 'Offline' : status === 1 ? 'Online' : 'Crashed'
  if (toDelete) statusText += ' (marked for deletion)'
  const handleClick = () => {
    router.push(href).catch(console.error)
  }

  return (
    <UnstyledLink href={href} onClick={e => e.preventDefault()}>
      <ListItem
        disablePadding
        secondaryAction={
          <>
            {status === 1 && (
              <Tooltip title='Kill'>
                <IconButton
                  aria-label='kill'
                  onClick={() => stopStartServer('KILL', server)}
                  color='secondary'
                >
                  <Close />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={status !== 1 ? 'Start' : 'Stop'}>
              <IconButton
                aria-label={status !== 1 ? 'start' : 'stop'}
                onClick={() => stopStartServer(status !== 1 ? 'START' : 'TERM', server)}
                color={status !== 1 ? 'primary' : 'secondary'}
              >
                {status !== 1 ? <PlayArrow /> : <Stop />}
              </IconButton>
            </Tooltip>
            {status === 1 && (
              <Tooltip title='Run Command'>
                <IconButton aria-label='run command' color='primary' onClick={() => openDialog()}>
                  <Terminal />
                </IconButton>
              </Tooltip>
            )}
          </>
        }
      >
        <ListItemButton dense onClick={handleClick}>
          <ListItemAvatar>
            <Avatar>
              <Storage />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={server} secondary={statusText} />
        </ListItemButton>
      </ListItem>
    </UnstyledLink>
  )
}

export default ServerListItem
