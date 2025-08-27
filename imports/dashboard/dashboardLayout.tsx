import styled from '@emotion/styled'
import Apps from '@mui/icons-material/Apps'
import Folder from '@mui/icons-material/Folder'
import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import Settings from '@mui/icons-material/Settings'
import Storage from '@mui/icons-material/Storage'
import Terminal from '@mui/icons-material/Terminal'
import TrendingUp from '@mui/icons-material/TrendingUp'
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import config from '../config'
import UnstyledLink from '../helpers/unstyledLink'
import getKy from '../helpers/useKy'
import Layout from '../layout'
import DashboardAppMenu from './dashboardAppMenu'
import useOctyneData from './useOctyneData'

const DashboardContainer = styled.div({
  padding: 20,
  flexDirection: 'column',
  display: 'flex',
  flex: 1,
})

const DrawerItem = (props: {
  icon: React.ReactElement
  name: string
  subUrl: string
}): React.JSX.Element => {
  const { server, node } = useOctyneData()
  const nodeUri = typeof node === 'string' ? `?node=${encodeURIComponent(node)}` : ''
  return (
    <UnstyledLink href={`/dashboard/${server}/${props.subUrl}${nodeUri}`}>
      <ListItemButton style={{ width: 200 }}>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.name} />
      </ListItemButton>
      <Divider />
    </UnstyledLink>
  )
}

const onLogout = (): void => {
  const token = localStorage.getItem('ecthelion:token')
  localStorage.removeItem('ecthelion:token')
  fetch(`${config.ip}/logout`, { headers: { Authorization: token ?? '' } }).catch(console.error)
}

const DashboardLayout = (
  props: React.PropsWithChildren<{ loggedIn: boolean }>,
): React.JSX.Element => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openAppMenu, setOpenAppMenu] = useState<null | HTMLElement>(null)
  const [servers, setServers] = useState<{
    default: Record<string, number> | null
    nodes: Record<string, Record<string, number> | null>
  }>({ default: null, nodes: {} })

  useEffect(() => {
    // TODO: Ideally move this to a global state so we don't trigger a refetch every time
    ;(async () => {
      const nodes = Object.keys(config.nodes ?? {})
      const [defaultReq, ...nodeReqs] = await Promise.allSettled([
        getKy()('servers'),
        ...nodes.map(node => getKy(node)('servers')),
      ])

      const newServers: typeof servers = { default: null, nodes: {} }
      if (defaultReq.status === 'fulfilled' && defaultReq.value.ok)
        newServers.default = (
          await defaultReq.value.json<{ servers: Record<string, number> }>()
        ).servers
      else
        console.error(
          'Failed to get server list of primary Octyne node!',
          defaultReq.status === 'fulfilled' ? defaultReq.value : defaultReq.reason,
        )

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const req = nodeReqs[i]
        if (req.status === 'fulfilled' && req.value.ok)
          newServers.nodes[node] = (
            await req.value.json<{ servers: Record<string, number> }>()
          ).servers
        else
          console.error(
            `Failed to get server list of Octyne node '${node}'!`,
            req.status === 'fulfilled' ? req.value : req.reason,
          )
      }
      setServers(newServers)
    })().catch(console.error)
  }, [])

  const { server, node } = useOctyneData()
  const drawerVariant = useMediaQuery(useTheme().breakpoints.only('xs')) ? 'temporary' : 'permanent'
  const appBarContent = (
    <>
      {props.loggedIn && drawerVariant === 'temporary' && (
        <>
          <IconButton
            color='inherit'
            aria-label='Open drawer'
            onClick={() => setOpenDrawer(!openDrawer)}
          >
            <MenuIcon />
          </IconButton>
          <div style={{ marginRight: 10 }} />
        </>
      )}
      <Typography variant='h6' color='inherit' style={{ flex: 1 }}>
        Octyne
      </Typography>
      {/* These are displayed unconditionally in case of individual node authentication failure. */}
      <UnstyledLink href='/servers'>
        <Tooltip title='Servers'>
          <IconButton size='large' color='inherit'>
            <Apps />
          </IconButton>
        </Tooltip>
      </UnstyledLink>
      <UnstyledLink href='/settings/about'>
        <Tooltip title='Settings'>
          <IconButton size='large' color='inherit'>
            <Settings />
          </IconButton>
        </Tooltip>
      </UnstyledLink>
      <UnstyledLink href='/'>
        <Tooltip title={props.loggedIn ? 'Logout' : 'Login'}>
          <IconButton size='large' edge='end' color='inherit' onClick={onLogout}>
            {props.loggedIn ? <Logout /> : <Login />}
          </IconButton>
        </Tooltip>
      </UnstyledLink>
    </>
  )
  return (
    <>
      <Layout appBar={appBarContent}>
        <DashboardAppMenu
          anchorEl={openAppMenu}
          onClose={() => setOpenAppMenu(null)}
          servers={servers}
        />
        {props.loggedIn && (
          <Drawer
            variant={drawerVariant}
            style={{ flexShrink: 0, width: 200 }}
            open={openDrawer}
            onClose={() => setOpenDrawer(!openDrawer)}
          >
            {drawerVariant === 'permanent' && <Toolbar />}
            <List style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <DrawerItem name='Statistics' subUrl='' icon={<TrendingUp />} />
              <DrawerItem name='Console' subUrl='console' icon={<Terminal />} />
              <DrawerItem name='Files' subUrl='files' icon={<Folder />} />
              <Divider style={{ flex: 1 }} />
              <ListItemButton onClick={e => setOpenAppMenu(e.currentTarget)} style={{ flex: 0 }}>
                <ListItemIcon>
                  <Storage />
                </ListItemIcon>
                <ListItemText primary={server ?? 'Server N/A'} secondary={node ?? 'Default node'} />
              </ListItemButton>
            </List>
          </Drawer>
        )}
        <DashboardContainer
          style={{ marginLeft: drawerVariant === 'permanent' && props.loggedIn ? '200px' : 0 }}
        >
          {props.children}
        </DashboardContainer>
      </Layout>
    </>
  )
}

export default DashboardLayout
