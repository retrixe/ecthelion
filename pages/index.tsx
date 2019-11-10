import React from 'react'
import {
  AppBar, Toolbar, Button, Typography, Paper, TextField, withWidth
} from '@material-ui/core'
import Link from 'next/link'
import Router from 'next/router'

import { ip } from '../config.json'
import fetch from 'isomorphic-unfetch'

interface S {
  username: string, password: string, failedAuth: boolean, invalid: boolean
}

// TODO:
/*
- Support toggling background gradient.
- Support customizable titles for servers.
- Have a rootURL environment variable.
*/

const description = 'Login page for Octyne.\nOctyne is a \
dashboard which allows efficient and easy to set up server administration.'

class Index extends React.Component<{ width: 'xs'|'sm'|'md'|'lg'|'xl' }, S> {
  constructor (props: { width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    super(props)
    this.state = { username: '', password: '', failedAuth: false, invalid: false }
    this.login = this.login.bind(this)
  }

  async login () {
    try {
      const request = await fetch(ip + '/login', {
        headers: { Username: this.state.username, Password: this.state.password }
      })
      // If request failed..
      if (!request.ok) {
        // If it was an authentication error, we handle it by setting failedAuth to true.
        if (request.status === 401) this.setState({ invalid: true, failedAuth: false })
        else this.setState({ invalid: false, failedAuth: true })
        return
      }
      // Save the access token in localStorage if we are on the client.
      // We'll add sessionStorage support later for Remember Me stuff.
      const response = await request.json()
      try {
        if (localStorage && response.token) {
          localStorage.setItem('token', response.token)
          // Also, if authentication previously failed, let's just say it succeeded.
          this.setState({ failedAuth: false, invalid: false })
          // Then we redirect to the new page.
          Router.push('/servers')
        }
      } catch (e) {}
    } catch (e) { this.setState({ failedAuth: true }) }
  }

  componentDidMount () {
    // Check the access token in localStorage if we are on the client.
    // We'll add sessionStorage support later for Remember Me stuff.
    try {
      if (localStorage && localStorage.getItem('token')) {
        // Also, if authentication previously failed, let's just say it succeeded.
        this.setState({ failedAuth: false, invalid: false })
        // Then we redirect to the new page.
        Router.push('/servers')
      }
    } catch (e) {}
  }

  render () {
    // Responsive styling.
    const paperStyle = ['xs', 'sm'].includes(this.props.width) ? { flex: 1 } : { width: '33vw' }
    const allowLogin = !this.state.username || !this.state.password
    const ResponsiveButton = ['xs', 'sm'].includes(this.props.width) ? (
      <Button variant='contained' color='secondary' onClick={this.login} fullWidth
        disabled={allowLogin}>Log In</Button>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button variant='contained' color='secondary' onClick={this.login} disabled={allowLogin}>
          Log In
        </Button>
      </div>
    )
    // Return the code.
    return (
      <div style={{ background: 'linear-gradient(to top, #fc00ff, #00dbde)' }}>
        <div style={{ marginRight: 16, marginLeft: 16 }}>
          <>
            <title>Octyne</title>
            {/* <meta property='og:url' content={`${rootURL}/`} /> */}
            <meta property='og:description' content={description} />
            <meta name='Description' content={description} />
          </>
          <AppBar>
            <Toolbar>
              <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
              <Link href='/about'><Button color='inherit'>About</Button></Link>
            </Toolbar>
          </AppBar>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'
          }}>
            <Paper elevation={24} style={{ padding: 15, ...paperStyle }}>
              <Typography variant='h5'>Log In</Typography><br />
              <Typography gutterBottom>
                Enter your designated username and password to access Octyne.
              </Typography>
              <TextField required label='Username' fullWidth value={this.state.username}
                onChange={e => this.setState({ username: e.target.value })} autoFocus
                error={this.state.failedAuth || this.state.invalid} />
              <br /><br />
              <TextField required label='Password' fullWidth value={this.state.password}
                onChange={e => this.setState({ password: e.target.value })} type='password'
                onSubmit={this.login} onKeyDown={e => e.key === 'Enter' && this.login()}
                error={this.state.failedAuth || this.state.invalid} />
              <br />{this.state.failedAuth ? (<><br />
                <Typography color='error'>An unknown error occurred. Is the server online?</Typography>
              </>) : ''}{this.state.invalid ? (<><br />
                <Typography color='error'>Your username or password is incorrect.</Typography>
              </>) : ''}<br />
              {ResponsiveButton}
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}

export default withWidth()(Index)
