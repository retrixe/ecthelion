import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Typography, TextField, Paper, NoSsr, styled } from '@mui/material'
import config from '../config.json'
import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import AnchorLink from '../imports/helpers/anchorLink'

const ButtonContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
}))

const Index = () => {
  const [failedAuth, setFailedAuth] = useState(false) // Unable to authorize with the server.
  const [invalid, setInvalid] = useState(false) // Invalid credentials.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passRef, setPassRef] = useState<HTMLInputElement | null>(null)

  const router = useRouter()
  try { router.prefetch('/servers') } catch {} // Prefetch the servers page for performance.

  // Check if already logged in when the page loads.
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
      const request = await fetch(config.ip + '/login', {
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

  return (
    <React.StrictMode>
      <Title
        title='Login - Ecthelion'
        description='The login page for Ecthelion, an Octyne frontend.'
        url='/'
        index
      />
      <Layout
        appBar={
          <>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <AnchorLink prefetch={false} href='/about'>
              <Button color='inherit'>About</Button>
            </AnchorLink>
          </>
        }
        removeToolbar
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          overflow: 'auto'
        }}
        >
          <NoSsr>
            <Paper
              elevation={24} sx={{
                margin: '10px',
                padding: '20px',
                width: { md: '420px' },
                maxWidth: { md: '33vw' },
                flex: { xs: 1, md: 'initial' }
              }}
            >
              <Typography variant='h5' gutterBottom>Log In</Typography>
              <Typography>Enter your designated username and password to access Octyne.</Typography>
              <br />
              <TextField
                required
                fullWidth
                label='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={failedAuth || invalid}
                onKeyDown={e => e.key === 'Enter' && passRef && passRef.focus()}
                autoFocus
              />
              <br /><br />
              <TextField
                required
                fullWidth
                inputRef={ref => setPassRef(ref)}
                label='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={failedAuth || invalid}
                type='password'
                onSubmit={handleLogin}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <br />
              {(failedAuth || invalid) && (
                <>
                  <br />
                  <Typography color='error'>
                    {failedAuth
                      ? 'An unknown error occurred. Is the server online?'
                      : 'Your username or password is incorrect.'}
                  </Typography>
                </>
              )}
              <br />
              <ButtonContainer>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={handleLogin}
                  disabled={!username || !password}
                  sx={{ width: { xs: '100%', md: 'initial' } }}
                >Log In
                </Button>
              </ButtonContainer>
            </Paper>
          </NoSsr>
        </div>
      </Layout>
    </React.StrictMode>
  )
}

export default Index
