import React from 'react'
import { Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import UnstyledLink from '../helpers/unstyledLink'

export const AuthFailure = (): JSX.Element => (
  <Paper style={{ padding: 10, marginBottom: '2em' }}>
    <Typography>It doesn&apos;t look like you should be here.</Typography>
    <UnstyledLink href={{ pathname: '/', query: { redirect: useRouter().asPath } }}>
      <Typography
        style={{ textDecoration: 'underline' }}
        onClick={() => {
          try { localStorage.removeItem('token') } catch (e) { }
        }}
      >Consider logging in?
      </Typography>
    </UnstyledLink>
  </Paper>
)

export default AuthFailure
