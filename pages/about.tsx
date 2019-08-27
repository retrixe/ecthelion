import React from 'react'
import {
  AppBar, Toolbar, Button, Typography
} from '@material-ui/core'
import Link from 'next/link'
import withRoot from '../components/imports/withRoot'

const description = `ReConsole is a Minecraft server control dashboard which allows efficient and \
easy to set up server administration.`

const Index = () => (
  <div style={{ marginRight: 16, marginLeft: 16 }}>
    <>
      <title>About ReConsole</title>
      {/* <meta property='og:url' content={`${rootURL}/`} /> */}
      <meta property='og:description' content={description} />
      <meta name='Description' content={description} />
    </>
    <AppBar>
      <Toolbar>
        <Typography variant='h6' color='inherit' style={{ flex: 1 }}>ReConsole</Typography>
        <Link prefetch href='/'><Button color='inherit'>Console</Button></Link>
      </Toolbar>
    </AppBar>
    <br /><br /><br /><br />
  </div>
)

export default withRoot(Index)
