import { Divider, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material'
import { useRouter } from 'next/router'
import React from 'react'
import config from '../config'
import useOctyneData from './useOctyneData'

const DashboardAppMenu = ({
  anchorEl,
  onClose,
  servers,
}: {
  anchorEl: null | HTMLElement
  onClose: () => void
  servers: {
    default: Record<string, number> | null
    nodes: Record<string, Record<string, number> | null>
  }
}): React.JSX.Element => {
  const router = useRouter()
  const { server, node } = useOctyneData()
  const dense = !useMediaQuery(useTheme().breakpoints.only('xs'))

  const handleClick = (app: string, node?: string) => () => {
    const newPath = {
      pathname: router.pathname,
      query: { ...router.query, server: app, node },
    }
    if (!node) delete newPath.query.node
    router.push(newPath).catch(console.error)
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      {Object.keys(config.nodes ?? {})
        .reverse()
        .map(node => [
          servers.nodes[node] ? (
            Object.keys(servers.nodes[node]).map(app => (
              <MenuItem
                dense={dense}
                key={node + '-' + app}
                selected={app === server && node === 'machine1'}
                onClick={handleClick(app, node)}
              >
                {app}
              </MenuItem>
            ))
          ) : (
            <MenuItem key={node + '-error'} dense={dense} disabled>
              Failed to fetch!
            </MenuItem>
          ),
          <MenuItem key={node} dense={dense} disabled>
            Node: {node}
          </MenuItem>,
          <Divider key={node + '-divider'} />,
        ])}
      {servers.default ? (
        Object.keys(servers.default).map(app => (
          <MenuItem
            dense={dense}
            key={app}
            selected={app === server && !node}
            onClick={handleClick(app)}
          >
            {app}
          </MenuItem>
        ))
      ) : (
        <MenuItem dense={dense} disabled>
          Failed to fetch!
        </MenuItem>
      )}
      <MenuItem dense={dense} disabled>
        Primary Octyne node
      </MenuItem>
    </Menu>
  )
}

export default DashboardAppMenu
