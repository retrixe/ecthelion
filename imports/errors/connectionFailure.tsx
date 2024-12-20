import React from 'react'
import { Paper, Typography, LinearProgress } from '@mui/material'

export const ConnectionFailure = (props: {
  loading: boolean
  title?: string
}): React.JSX.Element => (
  <Paper style={{ padding: 10, marginBottom: '2em' }}>
    {props.loading ? (
      <div style={{ padding: 6 }}>
        {props.title && (
          <Typography gutterBottom variant='h6'>
            {props.title}
          </Typography>
        )}
        <Typography gutterBottom>Loading...</Typography>
        <LinearProgress color='secondary' />
      </div>
    ) : (
      <>
        {props.title && (
          <Typography gutterBottom variant='h6'>
            {props.title}
          </Typography>
        )}
        <Typography>Looks like we can&apos;t connect to the server. Oops!</Typography>
        <Typography>
          Check if the server is online and the dashboard configured correctly.
        </Typography>
      </>
    )}
  </Paper>
)

export default ConnectionFailure
