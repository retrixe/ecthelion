import React from 'react'
import {
  AppBar, Toolbar, Button, Typography, Paper, withWidth, List, ListItem, Avatar,
  ListItemText, ListItemAvatar, Divider, ListItemSecondaryAction, IconButton, Tooltip,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@material-ui/core'
import Storage from '@material-ui/icons/Storage'
import Stop from '@material-ui/icons/Stop'
import Close from '@material-ui/icons/Close'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Comment from '@material-ui/icons/Comment'
import Link from 'next/link'

import { ip } from '../config.json'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'

interface S { loggedIn: boolean, servers?: { [name: string]: number }, command: string, server: string }

const description = 'The dashboard for Octyne.\nOctyne is a \
dashboard which allows efficient and easy to set up server administration.'

class Servers extends React.Component<{ width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }, S> {
  constructor (props: { width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    super(props)
    this.state = { loggedIn: false, command: '', server: '' }
  }

  async componentDidMount () {
    try {
      const servers = await fetch(
        ip + '/servers', { headers: { Authorization: localStorage.getItem('token') } }
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
    const handleClose = () => this.setState({ ...this.state, server: '' })
    const openDialog = (server: string) => this.setState({ ...this.state, server })
    const runCommand = () => {
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${this.state.server}/console`)
      ws.onopen = () => {
        ws.send(this.state.command)
        ws.close()
        handleClose()
      }
    }
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
          background: 'linear-gradient(to top, #fc00ff, #00dbde)', height: '100%', width: '100vw'
        }}>
          <div style={{ paddingTop: '6em', paddingLeft: 20, paddingRight: 20, minHeight: '100vh' }}>
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
              <List>
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
                        <Tooltip title={this.state.servers[server] !== 1 ? 'Start' : 'Stop'}>
                          <IconButton aria-label='start/stop' onClick={() => (this.stopStartServer(
                            this.state.servers[server] !== 1 ? 'start' : 'stop', server
                          ))} color={this.state.servers[server] !== 1 ? 'primary' : 'default'}>
                            {this.state.servers[server] !== 1 ? <PlayArrow /> : <Stop />}
                          </IconButton>
                        </Tooltip>
                        {this.state.servers[server] === 1 ? (
                          <Tooltip title='Kill'>
                            <IconButton aria-label='kill' onClick={() => (this.stopStartServer(
                              'kill', server
                            ))} color='secondary'><Close /></IconButton>
                          </Tooltip>
                        ) : ''}
                        {this.state.servers[server] === 1 ? (
                          <Tooltip title='Run Command'>
                            <IconButton aria-label='run command' color='primary' onClick={() => openDialog(server)}>
                              <Comment />
                            </IconButton>
                          </Tooltip>
                        ) : ''}
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Paper>}
          </div>
        </div>
        {/* Dialog */}
        <Dialog open={!!this.state.server} onClose={handleClose}>
          <DialogTitle>Run Command on {this.state.server}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin='dense'
              id='command'
              label='Command'
              value={this.state.command}
              onChange={e => this.setState({ ...this.state, command: e.target.value })}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color='default'>Cancel</Button>
            <Button onClick={runCommand} color='primary'>Run</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  async stopStartServer (operation: string, server: string) {
    if (operation === 'stop') {
      // Send commands.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${server}/console`)
      ws.onopen = () => {
        ws.send('save-all')
        setTimeout(() => ws.send('end'), 1000)
        setTimeout(() => { ws.send('stop'); ws.close() }, 5000)
        setTimeout(() => this.componentDidMount(), 10000)
      }
      return
    }
    try {
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + server, {
        headers: { Authorization: localStorage.getItem('token') },
        method: 'POST',
        body: operation === 'kill' ? 'STOP' : operation.toUpperCase()
      })
      if (res.status === 400) throw new Error()
      else this.componentDidMount()
    } catch (e) { }
  }
}

export default withWidth()(Servers)
