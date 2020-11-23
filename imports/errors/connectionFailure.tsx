import React from 'react'
import { Paper, Typography, LinearProgress } from '@material-ui/core'

export const ConnectionFailure = (props: { loading: boolean }) => (
  <Paper style={{ padding: 10 }}>
    {props.loading ? (
      <div style={{ padding: 6 }}>
        <Typography gutterBottom>Loading...</Typography>
        <LinearProgress />
      </div>
    ) : (
      <>
        <Typography>Looks like we can&apos;t connect to the server. Oops!</Typography>
        <Typography>Check if the server is online and the dashboard configured correctly.</Typography>
      </>
    )}
  </Paper>
)

export default ConnectionFailure
