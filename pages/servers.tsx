import React from 'react'
import {
  AppBar, Toolbar, Button, Typography, Paper, withWidth, List, ListItem, Avatar,
  ListItemText, ListItemAvatar, Divider, ListItemSecondaryAction, IconButton
} from '@material-ui/core'
import Storage from '@material-ui/icons/Storage'
import Stop from '@material-ui/icons/Stop'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Link from 'next/link'

import { ip } from '../config.json'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'

interface S { loggedIn: boolean, servers?: { [name: string]: number } }

const description = `The dashboard for Octyne.\nOctyne is a \
dashboard which allows efficient and easy to set up server administration.`

class Servers extends React.Component<{ width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }, S> {
  constructor (props: { width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    super(props)
    this.state = { loggedIn: false }
  }

  async componentDidMount () {
    try {
      const servers = await fetch(
        ip + '/servers', { headers: { 'Authorization': localStorage.getItem('token') } }
      )
      const parsed = await servers.json()
      if (
        localStorage && localStorage.getItem('token') && servers.ok
      ) this.setState({ loggedIn: true, servers: parsed.servers })
      else if (servers.status === 401) this.setState({ loggedIn: false })
    } catch (e) { }
  }

  render () {
    // Return the code.
    return (
      <div style={{ display: 'flex' }}>
        <>
          <title>Servers - Octyne</title>
          {/* <meta property='og:url' content={`${rootURL}/`} /> */}
          <meta property='og:description' content={description} />
          <meta name='Description' content={description} />
        </>
        {/* The AppBar. */}
        <AppBar style={{ width: '100vw', zIndex: this.props.width !== 'xs' ? 1000000000 : 1 }}>
          <Toolbar>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <Link href='/'><Button color='inherit' onClick={() => {
              try { localStorage.removeItem('token') } catch (e) { }
            }}>Logout</Button></Link>
            <div style={{ marginRight: 5 }} />
            <Link href='/about'><Button color='inherit'>About</Button></Link>
          </Toolbar>
        </AppBar>
        <div style={{
          background: 'linear-gradient(to top, #fc00ff, #00dbde)', height: '100vh', width: '100vw'
        }}>
          <div style={{ paddingTop: '6em', paddingLeft: 20, paddingRight: 20 }}>
            {!this.state.servers || !this.state.loggedIn ? (
              <Paper style={{ padding: 10 }}>
                <Typography>
                  {'It doesn\'t look like you should be here.'}
                </Typography>
                <Link href='/'>
                  <Typography color='primary' component='a' onClick={() => {
                    try { localStorage.removeItem('token') } catch (e) { }
                  }}>Consider logging in?</Typography>
                </Link>
              </Paper>
            ) : <Paper style={{ padding: 20 }}>
              <Typography gutterBottom variant='h5'>Servers</Typography>
              <Divider />
              <List component='nav'>
                {Object.keys(this.state.servers).map((server) => (
                  <div key={server}>
                    <ListItem dense button onClick={() => {
                      Router.push(`/dashboard?server=${server}`)
                    }}>
                      <ListItemAvatar><Avatar><Storage /></Avatar></ListItemAvatar>
                      <ListItemText primary={server} secondary={this.state.servers[server] === 0
                        ? 'Offline'
                        : (this.state.servers[server] === 1 ? 'Online' : 'Crashed')
                      } />
                      <ListItemSecondaryAction>
                        <IconButton aria-label='start' onClick={() => (this.stopStartServer(
                          this.state.servers[server] !== 1 ? 'start' : 'stop', server
                        ))}>
                          {this.state.servers[server] !== 1 ? <PlayArrow /> : <Stop />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Paper>}
          </div>
        </div>
      </div>
    )
  }

  async stopStartServer (operation: string, server: string) {
    try {
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + server, {
        headers: { 'Authorization': localStorage.getItem('token') },
        method: 'POST',
        body: operation.toUpperCase()
      })
      if (res.status === 400) throw new Error()
      else this.componentDidMount()
    } catch (e) { }
  }
}

export default withWidth()(Servers)
