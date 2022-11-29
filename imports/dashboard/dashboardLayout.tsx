import React, { useState } from 'react'
import {
  Typography, Button, IconButton, Drawer,
  List, ListItem, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme, Toolbar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import TrendingUp from '@mui/icons-material/TrendingUp'
import Settings from '@mui/icons-material/Settings'
import CallToAction from '@mui/icons-material/CallToAction'
import Storage from '@mui/icons-material/Storage'

import { useRouter } from 'next/router'
import Layout from '../layout'
import config from '../config'
import AnchorLink from '../helpers/anchorLink'

const DrawerItem = (props: { icon: React.ReactElement, name: string, subUrl: string }) => {
  const { server, node } = useRouter().query
  const nodeUri = typeof node === 'string' ? `?node=${encodeURIComponent(node)}` : ''
  return (
    <AnchorLink href={`/dashboard/${server}/${props.subUrl}${nodeUri}`}>
      <ListItem style={{ width: 200 }} button>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.name} />
      </ListItem>
      <Divider />
    </AnchorLink>
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
      <AnchorLink href='/'>
        <Button color='inherit' onClick={onLogout}>Logout</Button>
      </AnchorLink>
      <AnchorLink href='/servers'>
        <Button color='inherit'>Servers</Button>
      </AnchorLink>
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
              <DrawerItem name='Properties' subUrl='properties' icon={<Settings />} />
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
