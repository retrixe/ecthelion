import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Typography, TextField, withWidth, Paper } from '@material-ui/core'
import { ip } from '../config.json'
import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import AnchorLink from '../imports/helpers/anchorLink'

const Index = (props: { width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [failedAuth, setFailedAuth] = useState(false) // Unable to authorize with the server.
  const [invalid, setInvalid] = useState(false) // Invalid credentials.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  // Check if already logged in when the page loads. Do this AFTER validating credentials.
  useEffect(() => {
    // Check the access token in localStorage if we are on the client.
    // We'll add sessionStorage support later for Remember Me stuff.
    try {
      if (localStorage && localStorage.getItem('token')) {
        // Then we redirect to the new page.
        router.push('/servers')
      }
    } catch (e) {}
  }, [router])

  const handleLogin = async () => {
    try {
      const request = await fetch(ip + '/login', {
        headers: { Username: username, Password: password }
      })
      // If request failed..
      if (!request.ok) {
        // If it was an authentication error, we handle it by setting failedAuth to true.
        if (request.status === 401) {
          setInvalid(true)
          setFailedAuth(false)
        } else {
          setInvalid(false)
          setFailedAuth(true)
        }
        return
      }
      // Save the access token in localStorage if we are on the client.
      // We'll add sessionStorage support later for Remember Me stuff.
      const response = await request.json()
      if (localStorage && response.token) {
        localStorage.setItem('token', response.token)
        // Also, if authentication previously failed, let's just say it succeeded.
        setFailedAuth(false)
        setInvalid(false)
        // Then we redirect to the new page.
        router.push('/servers')
      }
    } catch (e) { setFailedAuth(true) }
  }

  // Responsive styling.
  const paperStyle = ['xs', 'sm'].includes(props.width)
    ? { flex: 1 }
    : { maxWidth: '33vw', width: '420px' }
  const ResponsiveButton = (
    <div style={['xs', 'sm'].includes(props.width) ? {} : {
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center'
    }}
    >
      <Button
        variant='contained'
        color='secondary'
        onClick={handleLogin}
        fullWidth={['xs', 'sm'].includes(props.width)}
        disabled={!username || !password}
      >Log In
      </Button>
    </div>
  )

  // Return final code.
  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Login - Ecthelion'
        description='The login page for Ecthelion, an Octyne frontend.'
        url='/'
      />
      <Layout
        appBar={
          <>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <AnchorLink href='/about'>
              <Button color='inherit'>About</Button>
            </AnchorLink>
          </>
        }
        removeToolbar
      >
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'
        }}
        >
          <Paper elevation={24} style={{ padding: 20, margin: 10, ...paperStyle }}>
            <Typography variant='h5'>Log In</Typography><br />
            <Typography gutterBottom>
              Enter your designated username and password to access Octyne.
            </Typography>
            <TextField
              required
              fullWidth
              label='Username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              error={failedAuth || invalid}
              autoFocus
            />
            <br /><br />
            <TextField
              required
              fullWidth
              label='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={failedAuth || invalid}
              type='password'
              onSubmit={handleLogin}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <br />
            {(failedAuth || invalid) ? (
              <>
                <br />
                <Typography color='error'>
                  {failedAuth
                    ? 'An unknown error occurred. Is the server online?'
                    : 'Your username or password is incorrect.'
                    // TODO
                    // eslint-disable-next-line react/jsx-curly-newline
                  }
                </Typography>
              </>
            ) : ''}
            <br />
            {ResponsiveButton}
          </Paper>
        </div>
      </Layout>
    </React.StrictMode>
  )
}

export default withWidth()(Index)
