import React from 'react'
import { Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import UnstyledLink from '../helpers/unstyledLink'

export const AuthFailure = (): React.JSX.Element => (
  <Paper style={{ padding: 10, marginBottom: '2em' }}>
    <Typography>It doesn&apos;t look like you should be here.</Typography>
    <UnstyledLink href={{ pathname: '/', query: { redirect: useRouter().asPath } }}>
      <Typography
        style={{ textDecoration: 'underline' }}
        onClick={() => {
          localStorage.removeItem('ecthelion:token')
        }}
      >
        Consider logging in?
      </Typography>
    </UnstyledLink>
  </Paper>
)

export default AuthFailure
