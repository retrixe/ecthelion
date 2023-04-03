import React, { useState } from 'react'
import {
  Typography, Button, IconButton, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme, Toolbar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import Info from '@mui/icons-material/Info'
import ManageAccounts from '@mui/icons-material/ManageAccounts'

import Layout from '../layout'
import config from '../config'
import UnstyledLink from '../helpers/unstyledLink'

const DrawerItem = (props: { icon: React.ReactElement, name: string, subUrl: string }) => {
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

const SettingsLayout = (props: React.PropsWithChildren<{ loggedIn: boolean }>) => {
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
      <UnstyledLink href='/'>
        <Button color='inherit' onClick={onLogout}>{props.loggedIn ? 'Logout' : 'Login'}</Button>
      </UnstyledLink>
      {props.loggedIn && (
        <UnstyledLink href='/servers'>
          <Button color='inherit'>Servers</Button>
        </UnstyledLink>
      )}
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
              {/* <DrawerItem name='Configuration' subUrl='config' icon={<Settings />} /> */}
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

const SettingsLayoutMemo = React.memo(SettingsLayout)
export default SettingsLayoutMemo
