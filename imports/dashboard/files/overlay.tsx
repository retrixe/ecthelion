import React from 'react'
import { Paper, Typography, LinearProgress } from '@mui/material'
import styled from '@emotion/styled'

const OverlayContainer = styled.div({
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
})

const Overlay = ({ message }: { message: string }): JSX.Element => (
  <OverlayContainer>
    <div style={{ flex: 1 }} />
    <Paper sx={{ height: '80px', m: '20px', p: '20px', ml: { xs: '20px', sm: '220px' } }}>
      <LinearProgress />
      <br />
      <Typography variant='body1'>{message}</Typography>
    </Paper>
  </OverlayContainer>
)

export default Overlay
