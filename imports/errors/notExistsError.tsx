import { Paper, Typography } from '@mui/material'
import React from 'react'
import UnstyledLink from '../helpers/unstyledLink'

export const NotExistsError = (props: { node?: boolean }): React.JSX.Element => (
  <Paper style={{ padding: 10 }}>
    <Typography>
      It looks like the {props.node ? 'node' : 'server'} specified in the URL doesn&apos;t exist.
    </Typography>
    <UnstyledLink href='/servers'>
      <Typography style={{ textDecoration: 'underline' }}>Go back to the Servers page?</Typography>
    </UnstyledLink>
  </Paper>
)

export default NotExistsError
