import React, { useState } from 'react'
import { Typography, Button, IconButton, Drawer, List, useMediaQuery, useTheme, Toolbar } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import TrendingUp from '@material-ui/icons/TrendingUp'
import Settings from '@material-ui/icons/Settings'
import CallToAction from '@material-ui/icons/CallToAction'
import Storage from '@material-ui/icons/Storage'

import Link from 'next/link'
import Layout from '../layout'
import DrawerItem from './drawerItem'
import useOctyneData from './useOctyneData'
import AnchorLink from '../helpers/anchorLink'

const DashboardLayout = (props: React.PropsWithChildren<{ loggedIn: boolean }>) => {
  const { ip } = useOctyneData()
  const [openDrawer, setOpenDrawer] = useState(false)
  const drawerVariant = useMediaQuery(useTheme().breakpoints.only('xs')) ? 'temporary' : 'permanent'
  const onLogout = () => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${ip}/logout`, { headers: { Authorization: token } })
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
      <Link href='/'>
        <Button color='inherit' onClick={onLogout}>Logout</Button>
      </Link>
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
        <div style={{ marginLeft: drawerVariant === 'permanent' && props.loggedIn ? '200px' : undefined }}>
          {props.children}
        </div>
      </Layout>
    </>
  )
}

const DashboardLayoutMemo = React.memo(DashboardLayout)
export default DashboardLayoutMemo
