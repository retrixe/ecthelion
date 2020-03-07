import React from 'react'
import { Paper, Typography, LinearProgress } from '@material-ui/core'

const Overlay = ({ message, xs }: { message: string, xs: boolean }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed', /* Sit on top of the page content */
      width: '100%', /* Full width (cover the whole page) */
      height: '100%', /* Full height (cover the whole page) */
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000
    }}
  >
    <div style={{ flex: 1 }} />
    <Paper style={{ padding: 20, height: 80, margin: 20, marginLeft: xs ? 20 : 220 }}>
      <LinearProgress />
      <br />
      <Typography variant='body1'>{message}</Typography>
    </Paper>
  </div>
)

export default Overlay
