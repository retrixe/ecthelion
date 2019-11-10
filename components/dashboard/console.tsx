import React from 'react'
import {
  Typography, Paper, Divider, TextField, Fab, Button
} from '@material-ui/core'
import Check from '@material-ui/icons/Check'
import Stop from '@material-ui/icons/Stop'
import Close from '@material-ui/icons/Close'
import PlayArrow from '@material-ui/icons/PlayArrow'

import { ip } from '../../config.json'
import { ConnectionFailure } from '../imports/connectionFailure'

interface S { // eslint-disable-next-line no-undef
  console: string, listening: boolean, ws?: WebSocket, command: string, kill: boolean, lastCmd: string
}

export default class Console extends React.Component<{ server: string }, S> {
  constructor (props: { server: string, width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    super(props)
    this.state = { listening: false, command: '', lastCmd: '', console: 'Loading...', kill: false }
    this.executeCommand = this.executeCommand.bind(this)
  }

  async componentDidMount () {
    try {
      // Connect to console.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      const ws = new WebSocket(`${ip.split('http').join('ws')}/server/${this.props.server}/console`)
      // This listener needs to be loaded ASAP.
      ws.onmessage = (event) => this.setState({ console: `${this.state.console}\n${event.data}` })
      this.setState({ ws, listening: true })
      // Register listeners.
      ws.onerror = () => {
        this.setState({ console: `${this.state.console}\nAn unknown error occurred.` })
      }
      ws.onclose = (event) => {
        this.setState({
          console: this.state.console + '\nThe connection to the server was abruptly closed.'
        })
        if (!event.wasClean) {} // Something.. later.
      }
    } catch (e) {
      console.error('Looks like an error occurred while connecting to console.\n' + e)
    }
  }

  // Close WebSocket when done.
  componentWillUnmount () { this.state.ws && this.state.ws.close() }

  async executeCommand () {
    try {
      if (!this.state.command) return
      this.setState({ console: `${this.state.console}\n>${this.state.command}` })
      this.state.ws.send(this.state.command)
      this.setState({ command: '', lastCmd: this.state.command })
    } catch (e) { console.error(e) }
  }

  // TODO: Should be moved to Statistics, or styling should be fixed.
  async stopStartServer (operation: string) {
    try {
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + this.props.server, {
        headers: { Authorization: localStorage.getItem('token') },
        method: 'POST',
        body: operation.toUpperCase()
      })
      if (res.status === 400) throw new Error()
      this.setState({ listening: true })
    } catch (e) {}
  }

  render () {
    // Return the code.
    if (!this.state.listening) return <ConnectionFailure />
    return (
      <>
        {/* Information about the server. */}
        <Paper style={{ padding: 20 }}>
          <Typography variant='h5' gutterBottom>Console - {this.props.server}</Typography>
          <Divider />
          <Paper style={{
            padding: 10, marginBottom: 10, backgroundColor: '#111111', height: '60vh'
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}>
              <div style={{ minHeight: '5px' }} />
              <Typography variant='body2' style={{ lineHeight: 1.5 }} component='div'>
                {this.lastEls(this.state.console.split('\n').map((i, index) => (
                  <div key={index}>{i}<br /></div>
                )), 650)
                /* Truncate to 650 lines due to performance issues afterwards. */}
              </Typography>
            </div>
          </Paper>
          <Divider />
          <Paper elevation={10} style={{ padding: 10, display: 'flex' }}>
            <TextField
              label='Input' value={this.state.command} fullWidth
              onChange={e => this.setState({ command: e.target.value })}
              onSubmit={this.executeCommand} color='secondary'
              onKeyDown={e => (e.key === 'Enter' && this.executeCommand()) || (
                e.key === 'ArrowUp' && this.setState({
                  command: this.state.lastCmd, lastCmd: this.state.command
                })
              )}
            /><div style={{ width: 10 }} />
            <Fab color='secondary' onClick={this.executeCommand}><Check /></Fab>
          </Paper>
        </Paper>
        {/* Some controls. */}
        <Paper elevation={10} style={{ marginTop: 10, marginBottom: 40, padding: 10 }}>
          <div style={{ display: 'flex' }}>
            <Button
              startIcon={<PlayArrow />}
              variant='contained'
              color='primary'
              onClick={() => this.stopStartServer('START')}
              fullWidth
            >Start</Button>
            <div style={{ margin: 10 }} />
            <Button variant='contained' color='primary' fullWidth startIcon={<Stop />} onClick={() => {
              this.state.ws.send('save-all')
              setTimeout(() => this.state.ws.send('end'), 1000)
              setTimeout(() => this.state.ws.send('stop'), 5000)
            }}>Stop</Button>
          </div>
          <div style={{ margin: 10 }} />
          <Button
            startIcon={<Close />}
            variant='contained'
            color='default'
            onClick={() => this.state.kill ? (this.stopStartServer('STOP') && this.setState({
              ...this.state, kill: false
            })) : this.setState({ ...this.state, kill: true })}
            fullWidth>{this.state.kill ? 'Confirm Kill?' : 'Kill'}</Button>
        </Paper>
      </>
    )
  }

  lastEls (array: Array<any>, size: number): Array<any> {
    const length = array.length
    if (length > 650) return array.slice(length - (size - 1))
    else return array
  }
}
