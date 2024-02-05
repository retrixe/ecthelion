import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import emotionStyled from '@emotion/styled'
import { Button, IconButton, Typography, TextField, Paper, NoSsr, styled, Tooltip } from '@mui/material'
import Info from '@mui/icons-material/Info'
import config from '../imports/config'
import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import useKy from '../imports/helpers/useKy'
import UnstyledLink from '../imports/helpers/unstyledLink'

const ButtonContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
}))

const IndexContainer = emotionStyled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  overflow: 'auto'
})

const Index = (): JSX.Element => {
  const [failedAuth, setFailedAuth] = useState(false) // Unable to authorize with the server.
  const [invalid, setInvalid] = useState(false) // Invalid credentials.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passRef, setPassRef] = useState<HTMLInputElement | null>(null)

  const ky = useKy()
  const router = useRouter()
  const route = typeof router.query.redirect === 'string' ? router.query.redirect : '/servers'

  // Check if already logged in when the page loads.
  useEffect(() => {
    ky.get('servers', { throwHttpErrors: true })
      .then(async () => await router.push(route).catch(console.error))
      .catch(async () => await router.prefetch(route).catch(console.error))
  }, [ky, router, route])

  const login = async (): Promise<void> => {
    try {
      const querystring = config.enableCookieAuth ? '?cookie=true' : ''
      const request = await fetch(config.ip + '/login' + querystring, {
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
      const response = await request.json() as { token?: string, success: boolean }
      if (response.token ?? response.success) {
        // Save the access token in localStorage if received in JSON body.
        if (response.token) localStorage.setItem('ecthelion:token', response.token)
        // Also, if authentication previously failed, let's just say it succeeded.
        setFailedAuth(false)
        setInvalid(false)
        // Then we redirect to the new page.
        router.push(route).catch(console.error)
      }
    } catch (e) { setFailedAuth(true) }
  }

  const handleLogin = (): void => { login().catch(() => {}) }

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
            <UnstyledLink prefetch={false} href='/settings/about'>
              <Tooltip title='About'>
                <IconButton size='large' edge='end' color='inherit'><Info /></IconButton>
              </Tooltip>
            </UnstyledLink>
          </>
        }
        removeToolbar
      >
        <IndexContainer>
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
                inputRef={(ref: HTMLInputElement) => setPassRef(ref)}
                label='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={failedAuth || invalid}
                type='password'
                onSubmit={handleLogin}
                onKeyDown={e => { e.key === 'Enter' && handleLogin() }}
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
        </IndexContainer>
      </Layout>
    </React.StrictMode>
  )
}

export default Index
