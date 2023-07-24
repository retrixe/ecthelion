import React, { useState } from 'react'
import styled from '@emotion/styled'
import {
  Typography, IconButton, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme, Toolbar, Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import Apps from '@mui/icons-material/Apps'
import Info from '@mui/icons-material/Info'
import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import ManageAccounts from '@mui/icons-material/ManageAccounts'
import Settings from '@mui/icons-material/Settings'

import Layout from '../layout'
import config from '../config'
import UnstyledLink from '../helpers/unstyledLink'

const SettingsContainer = styled.div({
  padding: 20,
  flexDirection: 'column',
  display: 'flex',
  flex: 1
})

const DrawerItem = (props: { icon: React.ReactElement, name: string, subUrl: string }): JSX.Element => {
  return (
    <UnstyledLink href={`/settings/${props.subUrl}`}>
      <ListItemButton style={{ width: 200 }}>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.name} />
      </ListItemButton>
      <Divider />
    </UnstyledLink>
  )
}

const onLogout = (): void => {
  const token = localStorage.getItem('token')
  if (token) {
    fetch(`${config.ip}/logout`, { headers: { Authorization: token } }).catch(console.error)
    localStorage.removeItem('token')
  }
}

const SettingsLayout = (props: React.PropsWithChildren<{ loggedIn: boolean }>): JSX.Element => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const drawerVariant = useMediaQuery(useTheme().breakpoints.only('xs')) ? 'temporary' : 'permanent'
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
      {props.loggedIn && (
        <UnstyledLink href='/servers'>
          <Tooltip title='Servers'>
            <IconButton size='large' color='inherit'><Apps /></IconButton>
          </Tooltip>
        </UnstyledLink>
      )}
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
              <DrawerItem name='About' subUrl='about' icon={<Info />} />
              <DrawerItem name='Accounts' subUrl='accounts' icon={<ManageAccounts />} />
              <DrawerItem name='Configuration' subUrl='config' icon={<Settings />} />
            </List>
          </Drawer>
        )}
        <SettingsContainer
          style={{ marginLeft: drawerVariant === 'permanent' && props.loggedIn ? '200px' : 0 }}
        >
          {props.children}
        </SettingsContainer>
      </Layout>
    </>
  )
}

export default SettingsLayout
