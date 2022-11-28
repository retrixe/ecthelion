import React, { useState } from 'react'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import config from '../imports/config'
import Layout from '../imports/layout'
import Title from '../imports/helpers/title'
import Message from '../imports/helpers/message'
import AnchorLink from '../imports/helpers/anchorLink'
import ServerList from '../imports/servers/serverList'
import AuthFailure from '../imports/errors/authFailure'
import ConnectionFailure from '../imports/errors/connectionFailure'
const { ip, nodes } = config as { ip: string, nodes: { [index: string]: string } }

const Servers = () => {
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
            <Link href='/'>
              <Button
                color='inherit'
                onClick={() => {
                  const token = localStorage.getItem('token')
                  if (token) {
                    fetch(`${ip}/logout`, { headers: { Authorization: token } })
                    localStorage.removeItem('token')
                  }
                }}
              >Logout
              </Button>
            </Link>
            <div style={{ marginRight: 5 }} />
            <AnchorLink prefetch={false} href='/about'>
              <Button color='inherit'>About</Button>
            </AnchorLink>
          </>
        }
      >
        <div style={{ marginTop: '2em', paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
          {failure === 'failed'
            ? <ConnectionFailure loading={false} />
            : (failure === 'logged out' ? <AuthFailure /> : (
              <>
                <ServerList ip={ip} setMessage={setMessage} setFailure={setFailure} />
                {Object.keys(nodes).map(key => (
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
