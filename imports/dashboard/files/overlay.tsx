import React from 'react'
import { Paper, Typography, LinearProgress, type LinearProgressProps, Box } from '@mui/material'
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
  zIndex: 2000,
  pointerEvents: 'none'
})

// https://github.com/mui/material-ui/blob/v5.14.4/docs/data/material/components/progress/LinearWithValueLabel.tsx
function LinearProgressWithLabel (props: LinearProgressProps & { value: number }): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2' color='text.secondary'>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}

const Overlay = (props: { display: string | { text: string, progress: number } }): JSX.Element => (
  <OverlayContainer>
    <div style={{ flex: 1 }} />
    <Paper
      elevation={3} sx={{
        height: '80px',
        m: '28px',
        p: '20px',
        ml: { xs: '28px', sm: '228px' },
        pt: typeof props.display === 'string' ? '20px' : '14px'
      }}
    >
      {typeof props.display === 'string'
        ? <LinearProgress color='secondary' />
        : <LinearProgressWithLabel color='secondary' value={props.display.progress} />}
      <div style={{ height: typeof props.display === 'string' ? '1rem' : '0.6rem' }} />
      <Typography variant='body1'>
        {typeof props.display === 'string' ? props.display : props.display.text}
      </Typography>
    </Paper>
  </OverlayContainer>
)

export default Overlay
