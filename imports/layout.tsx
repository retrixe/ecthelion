import React from 'react'
import { AppBar, Toolbar } from '@material-ui/core'

const Layout = (props: React.PropsWithChildren<{
  appBar?: React.ReactNode,
  removeToolbar?: boolean
}>) => (
  <div
    style={{
      background: 'linear-gradient(to top, #fc00ff, #00dbde)',
      minHeight: '100vh',
      width: '100vw',
      minWidth: '100%'
    }}
  >
    <AppBar style={{ zIndex: 1000000 }}>
      <Toolbar style={{ minWidth: '100vw' }}>
        {props.appBar}
      </Toolbar>
    </AppBar>
    {props.removeToolbar ? '' : <Toolbar />}
    {props.children}
  </div>
)

export default Layout
