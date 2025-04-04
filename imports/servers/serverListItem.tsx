import React from 'react'
import { useRouter } from 'next/router'
import {
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material'

import Storage from '@mui/icons-material/Storage'
import Stop from '@mui/icons-material/Stop'
import Close from '@mui/icons-material/Close'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Terminal from '@mui/icons-material/Terminal'
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
            {/* Former color scheme: primary/(default, secondary, primary) */}
            <Tooltip title={status !== 1 ? 'Start' : 'Stop'}>
              <IconButton
                aria-label={status !== 1 ? 'start' : 'stop'}
                onClick={() => stopStartServer(status !== 1 ? 'START' : 'TERM', server)}
                color='default'
              >
                {status !== 1 ? <PlayArrow /> : <Stop />}
              </IconButton>
            </Tooltip>
            {status === 1 && (
              <Tooltip title='Kill'>
                <IconButton
                  aria-label='kill'
                  onClick={() => stopStartServer('KILL', server)}
                  color='primary'
                >
                  <Close />
                </IconButton>
              </Tooltip>
            )}
            {status === 1 && (
              <Tooltip title='Run Command'>
                <IconButton aria-label='run command' color='secondary' onClick={() => openDialog()}>
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
