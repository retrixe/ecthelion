import React from 'react'
import { Paper, Typography } from '@mui/material'
import AnchorLink from '../helpers/anchorLink'

export const NotExistsError = (props: { node?: boolean }) => (
  <Paper style={{ padding: 10 }}>
    <Typography>
      It looks like the {props.node ? 'node' : 'server'} specified in the URL doesn&apos;t exist.
    </Typography>
    <AnchorLink href='/servers'>
      <Typography style={{ textDecoration: 'underline' }}>Go back to the Servers page?</Typography>
    </AnchorLink>
  </Paper>
)

export default NotExistsError
