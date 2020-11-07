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
    <style jsx global>
      {`
      body {
        /* background: linear-gradient(to top, #fc00ff, #00dbde); */
        /* Ash gradient: */
        /* background: #606c88;  /* fallback for old browsers */
        /* background: -webkit-linear-gradient(to top, #3f4c6b, #606c88);  /* Chrome 10-25, Safari 5.1-6 */
        /* background: linear-gradient(to top, #3f4c6b, #606c88); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
      }
      `}
    </style>
    <AppBar className={useStyles().appBar}>
      <Toolbar style={{ minWidth: '100vw' }}>
        {props.appBar}
      </Toolbar>
    </AppBar>
    {props.removeToolbar ? '' : <Toolbar />}
    {props.children}
  </div>
)

const LayoutMemo = React.memo(Layout)
export default LayoutMemo
