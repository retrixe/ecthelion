import React from 'react'
import {
  Typography, Paper, Divider, TextField, Fab, Button, withWidth
} from '@material-ui/core'
import Check from '@material-ui/icons/Check'

import { ip } from '../../config.json'
import { ConnectionFailure } from '../imports/connectionFailure'

interface S { // eslint-disable-next-line no-undef
  console: string, listening: boolean, ws?: WebSocket, command: string
}

// TODO: Should be moved to Statistics, or styling should be fixed.
class Console extends React.Component<{ server: string, width: 'xs'|'sm'|'md'|'lg'|'xl' }, S> {
  constructor (props: { server: string, width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    super(props)
    this.state = { listening: false, command: '', console: 'Loading...' }
    this.executeCommand = this.executeCommand.bind(this)
  }

  async componentDidMount () {
    try {
      // Connect to console.
      document.cookie = `X-Authentication=${localStorage.getItem('token')}`
      let ws = new WebSocket(`${ip.split('http').join('ws')}/server/${this.props.server}/console`)
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
      this.setState({ command: '' })
    } catch (e) { console.error(e) }
  }

  // TODO: Should be moved to Statistics, or styling should be fixed.
  async stopStartServer (operation: string) {
    try {
      // Send the request to stop or start the server.
      const res = await fetch(ip + '/server/' + this.props.server, {
        headers: { 'Authorization': localStorage.getItem('token') },
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
    // TODO: Should be moved to Statistics, or styling should be fixed.
    const ResponsiveButton = ['xs', 'sm', 'md', 'lg', 'xl'].includes(this.props.width) ? (props: any) => (
      <Button variant='contained' color='primary' onClick={() => this.stopStartServer(
        props.children.toUpperCase()
      )} fullWidth>
        {props.children}
      </Button>
    ) : (props: any) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button variant='contained' color='primary' onClick={() => this.stopStartServer(
          props.children.toUpperCase()
        )}>
          {props.children}
        </Button>
      </div>
    )
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
              <Typography variant='body2' style={{ lineHeight: 1.5 }} component='div'>
                {this.state.console.split('\n').map((i, index) => (
                  <div key={index}>{i}<br /></div>
                )).slice(this.state.console.split('\n').length - 11)
                /* Truncate to 650 lines due to performance issues afterwards. */}
              </Typography>
              <Typography variant='body2' style={{ lineHeight: 1.5 }} component='div'>
                {this.lastEls(this.state.console.split('\n').map((i, index) => (
                  <div key={index}>{i}<br /></div>
                )), 650)
                /* Truncate to 650 lines due to performance issues afterwards. */}
              </Typography>
              <div />
            </div>
          </Paper>
          <Divider />
          <Paper elevation={10} style={{ padding: 10, display: 'flex' }}>
            <TextField
              label='Input' value={this.state.command} fullWidth
              onChange={e => this.setState({ command: e.target.value })}
              onSubmit={this.executeCommand} color='secondary'
              onKeyPress={e => e.key === 'Enter' && this.executeCommand()}
            /><div style={{ width: 10 }} />
            <Fab color='secondary' onClick={this.executeCommand}><Check /></Fab>
          </Paper>
        </Paper>
        {/* Some controls. */}
        <Paper elevation={10} style={{ marginTop: 10, padding: 10 }}>
          <ResponsiveButton>Stop</ResponsiveButton>
          <div style={{ margin: 10 }} />
          <ResponsiveButton>Start</ResponsiveButton>
        </Paper>
      </>
    )
  }

  lastEls (array: Array<any>, size: number): Array<any> {
    const length = array.length
    if (length > 650) return array.slice(length - (size - 1), length - 10)
    else return array.slice(0, length - 10)
  }
}

// TODO: Should be moved to Statistics, or styling should be fixed.
export default withWidth()(Console)
