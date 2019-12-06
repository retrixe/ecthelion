import React from 'react'
import { Paper, Typography } from '@material-ui/core'
import Link from 'next/link'

export const AuthFailure = () => (
  <Paper style={{ padding: 10 }}>
    <Typography>It doesn&apos;t look like you should be here.</Typography>
    <Link href='/'>
      <Typography
        color='primary'
        component='a'
        onClick={() => {
          try { localStorage.removeItem('token') } catch (e) { }
        }}
      >Consider logging in?
      </Typography>
    </Link>
  </Paper>
)

export default AuthFailure
