import React, { useState } from 'react'
import {
  Typography, IconButton, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme, Toolbar, Tooltip
} from '@mui/material'
import Apps from '@mui/icons-material/Apps'
import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import TrendingUp from '@mui/icons-material/TrendingUp'
import CallToAction from '@mui/icons-material/CallToAction'
import Settings from '@mui/icons-material/Settings'
import Storage from '@mui/icons-material/Storage'

import { useRouter } from 'next/router'
import Layout from '../layout'
import config from '../config'
import UnstyledLink from '../helpers/unstyledLink'

const DrawerItem = (props: { icon: React.ReactElement, name: string, subUrl: string }) => {
  const { server, node } = useRouter().query
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

const DashboardLayout = (props: React.PropsWithChildren<{ loggedIn: boolean }>) => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const drawerVariant = useMediaQuery(useTheme().breakpoints.only('xs')) ? 'temporary' : 'permanent'
  const onLogout = () => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${config.ip}/logout`, { headers: { Authorization: token } })
      localStorage.removeItem('token')
    }
  }

  const appBarContent = (
    <>
      {(props.loggedIn && drawerVariant === 'temporary') && (
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
      <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
      {/* These are displayed unconditionally in case of individual node authentication failure. */}
      <UnstyledLink href='/servers'>
        <Tooltip title='Servers'>
          <IconButton size='large' color='inherit'><Apps /></IconButton>
        </Tooltip>
      </UnstyledLink>
      <UnstyledLink href='/settings/about'>
        <Tooltip title='Settings'>
          <IconButton size='large' color='inherit'><Settings /></IconButton>
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
        {props.loggedIn && (
          <Drawer
            variant={drawerVariant}
            style={{ flexShrink: 0, width: 200 }}
            open={openDrawer}
            onClose={() => setOpenDrawer(!openDrawer)}
          >
            {drawerVariant === 'permanent' && <Toolbar />}
            <List>
              <DrawerItem name='Statistics' subUrl='' icon={<TrendingUp />} />
              <DrawerItem name='Console' subUrl='console' icon={<CallToAction />} />
              <DrawerItem name='Files' subUrl='files' icon={<Storage />} />
            </List>
          </Drawer>
        )}
        <div style={{
          padding: 20,
          marginLeft: drawerVariant === 'permanent' && props.loggedIn ? '200px' : undefined,
          flexDirection: 'column',
          display: 'flex',
          flex: 1
        }}
        >
          {props.children}
        </div>
      </Layout>
    </>
  )
}

const DashboardLayoutMemo = React.memo(DashboardLayout)
export default DashboardLayoutMemo
