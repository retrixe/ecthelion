import React, { useState, useEffect } from 'react'
import { Button, Typography, Paper, Divider } from '@mui/material'

import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import AnchorLink from '../imports/helpers/anchorLink'
import packageJson from '../package.json'

const { version } = packageJson

const About = () => {
  const [loggedIn, setLoggedIn] = useState(true)

  useEffect(() => {
    // (async () => {
    try {
      const token = localStorage.getItem('token')
      setLoggedIn(!!token)
      /*
        if (!token) return
        const servers = await fetch(ip + '/servers', { headers: { Authorization: token } })
        if (servers.ok) {
          setLoggedIn(true)
        } else if (servers.status === 401) setLoggedIn('failed')
        else setLoggedIn(false)
        */
    } catch (e) {
      setLoggedIn(false)
    }
    // })()
  }, [])

  // Return final code.
  return (
    <React.StrictMode>
      <Title
        title='About - Ecthelion'
        description='About this running instance of Ecthelion.'
        url='/about'
      />
      <Layout
        appBar={
          <>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <AnchorLink href={loggedIn ? '/servers' : '/'}>
              <Button color='inherit'>{loggedIn ? 'Servers' : 'Login'}</Button>
            </AnchorLink>
          </>
        }
      >
        <div style={{ marginTop: '2em', paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
          <Paper style={{ padding: 20 }}>
            <Typography gutterBottom variant='h5'>About Ecthelion</Typography>
            <Divider style={{ marginBottom: '0.70em' }} />
            <Typography gutterBottom>This instance is running Ecthelion {version}.</Typography>
            <div style={{ marginBottom: '0.35em' }} />
            <Typography variant='h6'>Some quick tips:</Typography>
            <Typography component='ul' style={{ paddingInlineStart: 20 }}>
              <li>You can drag and drop files from your system onto the file explorer&apos;s file list!</li>
              <li>You can Ctrl+Click files to select them (Shift+Click coming soon)!</li>
              <li>You can upload multiple files at once!</li>
              <li>Text files can be created and opened inside Ecthelion!
                Don&apos;t worry, you can still download them from the file menu or the editor.
              </li>
              {/* <li>The stop button updates after 10 seconds and console is limited to 650 lines.</li> */}
            </Typography>
          </Paper>
        </div>
      </Layout>
    </React.StrictMode>
  )
}

export default About
