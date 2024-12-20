import React from 'react'
import { AppBar, Toolbar } from '@mui/material'
import styled from '@emotion/styled'

const LayoutContainer = styled.div({
  // background: 'linear-gradient(to top, #fc00ff, #00dbde)',
  minHeight: '100vh',
  width: '100vw',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  // minWidth: '100%'
})

const Layout = (
  props: React.PropsWithChildren<{
    appBar?: React.ReactNode
    removeToolbar?: boolean
  }>,
): React.JSX.Element => (
  <LayoutContainer>
    {/* <style jsx global>
      {`
      body {
        /* background: linear-gradient(to top, #fc00ff, #00dbde); /
        /* Ash gradient: /
        /* background: #606c88;  /* fallback for old browsers /
        /* background: -webkit-linear-gradient(to top, #3f4c6b, #606c88);  /* Chrome 10-25, Safari 5.1-6 /
        /* background: linear-gradient(to top, #3f4c6b, #606c88); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ /
      }
      `}
    </style> */}
    <AppBar sx={{ zIndex: { xs: 'appBar', sm: 1201 /* theme => theme.zIndex.drawer + 1 */ } }}>
      <Toolbar style={{ minWidth: '100vw' }}>{props.appBar}</Toolbar>
    </AppBar>
    {props.removeToolbar ? '' : <Toolbar />}
    {props.children}
  </LayoutContainer>
)

export default Layout
