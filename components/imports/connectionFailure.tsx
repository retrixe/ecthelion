import React from 'react'
import { Paper, Typography } from '@material-ui/core'

export const ConnectionFailure = () => (
  <Paper style={{ padding: 10 }}>
    <Typography>Looks like we can{`'`}t connect to the server. Oops!</Typography>
    <Typography>Check if the server is online and the dashboard configured correctly.</Typography>
  </Paper>
)
