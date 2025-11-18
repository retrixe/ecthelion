import Close from '@mui/icons-material/Close'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Stop from '@mui/icons-material/Stop'
import { Button, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'

const IconConsoleButtons = ({
  stopStartServer,
}: {
  stopStartServer: (operation: 'START' | 'TERM' | 'KILL') => void
}): React.JSX.Element => (
  <>
    <Tooltip title='Start'>
      <IconButton onClick={() => stopStartServer('START')}>
        <PlayArrow />
      </IconButton>
    </Tooltip>
    <Tooltip title='Stop'>
      <IconButton onClick={() => stopStartServer('TERM')}>
        <Stop />
      </IconButton>
    </Tooltip>
    <Tooltip title='Kill'>
      <IconButton color='error' onClick={() => stopStartServer('KILL')}>
        <Close />
      </IconButton>
    </Tooltip>
  </>
)

const ConsoleButtons = ({
  stopStartServer,
}: {
  stopStartServer: (operation: 'START' | 'TERM' | 'KILL') => void
}): React.JSX.Element => {
  const smallScreen = useMediaQuery(useTheme().breakpoints.down('md'))
  const [confirmingKill, setConfirmingKill] = useState(false)

  if (smallScreen) {
    return IconConsoleButtons({ stopStartServer })
  }

  return (
    <>
      <Button
        startIcon={<PlayArrow />}
        variant='contained'
        onClick={() => stopStartServer('START')}
      >
        Start
      </Button>
      <Button variant='contained' startIcon={<Stop />} onClick={() => stopStartServer('TERM')}>
        Stop
      </Button>
      <Button
        startIcon={<Close />}
        color='secondary'
        variant='contained'
        onClick={() => {
          if (confirmingKill) {
            setConfirmingKill(false)
            stopStartServer('KILL')
          } else setConfirmingKill(true)
        }}
      >
        {confirmingKill ? 'Confirm Kill?' : 'Kill'}
      </Button>
    </>
  )
}

export default ConsoleButtons
