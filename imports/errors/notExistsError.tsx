import React from 'react'
import { Paper, Typography } from '@material-ui/core'
import Link from 'next/link'

export const NotExistsError = (props: { node?: boolean }) => (
  <Paper style={{ padding: 10 }}>
    <Typography>
      It looks like the {props.node ? 'node' : 'server'} specified in the URL doesn&apos;t exist.
    </Typography>
    <Link href='/servers'>
      <Typography color='primary' component='a'>Go back to the Servers page?</Typography>
    </Link>
  </Paper>
)

export default NotExistsError
