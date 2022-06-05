import React from 'react'
import { Paper, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'

export const AuthFailure = () => (
  <Paper style={{ padding: 10, marginBottom: '2em' }}>
    <Typography>It doesn&apos;t look like you should be here.</Typography>
    <Link href={{ pathname: '/', query: { redirect: useRouter().asPath } }}>
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
