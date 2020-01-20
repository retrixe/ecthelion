import React from 'react'
import { AppBar, Toolbar, createStyles, makeStyles, Theme } from '@material-ui/core'

const useStyles = makeStyles(
  (theme: Theme) => createStyles({ appBar: { zIndex: theme.zIndex.drawer + 1 } })
)

const Layout = (props: React.PropsWithChildren<{
  appBar?: React.ReactNode,
  removeToolbar?: boolean
}>) => (
  <div
    style={{
      // background: 'linear-gradient(to top, #fc00ff, #00dbde)',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%'
      // minWidth: '100%'
    }}
  >
    <style>{'body { background: linear-gradient(to top, #fc00ff, #00dbde); }'}</style>
    <AppBar className={useStyles().appBar}>
      <Toolbar style={{ minWidth: '100vw' }}>
        {props.appBar}
      </Toolbar>
    </AppBar>
    {props.removeToolbar ? '' : <Toolbar />}
    {props.children}
  </div>
)

export default Layout
