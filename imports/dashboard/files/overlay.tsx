import React from 'react'
import { Paper, Typography, LinearProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  paperStyle: {
    height: 80,
    margin: 20,
    padding: 20,
    marginLeft: 220,
    [theme.breakpoints.only('xs')]: {
      marginLeft: 20
    }
  }
}))

const Overlay = ({ message }: { message: string }) => (
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
    <Paper className={useStyles().paperStyle}>
      <LinearProgress />
      <br />
      <Typography variant='body1'>{message}</Typography>
    </Paper>
  </div>
)

export default Overlay
