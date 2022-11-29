import React from 'react'
import { Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import AnchorLink from '../helpers/anchorLink'

export const AuthFailure = () => (
  <Paper style={{ padding: 10, marginBottom: '2em' }}>
    <Typography>It doesn&apos;t look like you should be here.</Typography>
    <AnchorLink href={{ pathname: '/', query: { redirect: useRouter().asPath } }}>
      <Typography
        style={{ textDecoration: 'underline' }}
        onClick={() => {
          try { localStorage.removeItem('token') } catch (e) { }
        }}
      >Consider logging in?
      </Typography>
    </AnchorLink>
  </Paper>
)

export default AuthFailure
