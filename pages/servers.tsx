import React, { useState } from 'react'
import { IconButton, Tooltip, Typography } from '@mui/material'
import Info from '@mui/icons-material/Info'
import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import Settings from '@mui/icons-material/Settings'
import config from '../imports/config'
import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import Message from '../imports/helpers/message'
import UnstyledLink from '../imports/helpers/unstyledLink'
import ServerList from '../imports/servers/serverList'
import AuthFailure from '../imports/errors/authFailure'
import ConnectionFailure from '../imports/errors/connectionFailure'
const { ip, nodes } = config

const logout = (): void => {
  const token = localStorage.getItem('ecthelion:token')
  localStorage.removeItem('ecthelion:token')
  fetch(`${config.ip}/logout`, { headers: { Authorization: token ?? '' } }).catch(console.error)
}

const Servers = (): JSX.Element => {
  const [message, setMessage] = useState('')
  const [failure, setFailure] = useState<'logged out' | 'failed' | false>(false)

  // Return final code.
  return (
    <React.StrictMode>
      <Title
        title='Servers - Ecthelion'
        description='The list of servers on Octyne.'
        url='/servers'
      />
      <Layout
        appBar={
          <>
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <UnstyledLink prefetch={false} href='/settings/about'>
              <Tooltip title={failure === 'logged out' ? 'About' : 'Settings'}>
                <IconButton size='large' color='inherit'>
                  {failure === 'logged out' ? <Info /> : <Settings />}
                </IconButton>
              </Tooltip>
            </UnstyledLink>
            <UnstyledLink href='/'>
              <Tooltip title={failure === 'logged out' ? 'Login' : 'Logout'}>
                <IconButton edge='end' size='large' color='inherit' onClick={logout}>
                  {failure === 'logged out' ? <Login /> : <Logout />}
                </IconButton>
              </Tooltip>
            </UnstyledLink>
          </>
        }
      >
        <div style={{ marginTop: '2em', paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
          {failure === 'failed'
            ? <ConnectionFailure loading={false} />
            : (failure === 'logged out' ? <AuthFailure /> : (
              <>
                <ServerList ip={ip} setMessage={setMessage} setFailure={setFailure} />
                {nodes && Object.keys(nodes).map(key => (
                  <ServerList key={key} node={key} ip={nodes[key]} setMessage={setMessage} />
                ))}
              </>
              ))}
        </div>
      </Layout>
      {/* Error message to show. */}
      {message && <Message message={message} setMessage={setMessage} />}
    </React.StrictMode>
  )
}

export default Servers
