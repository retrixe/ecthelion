import React, { useState } from 'react'
import { Paper, Button, useMediaQuery, useTheme } from '@material-ui/core'
import Stop from '@material-ui/icons/Stop'
import Close from '@material-ui/icons/Close'
import PlayArrow from '@material-ui/icons/PlayArrow'

const ConsoleButtons = ({ stopStartServer, ws }: {
  stopStartServer: (operation: 'START' | 'STOP') => Promise<void>, ws: WebSocket | null
}) => {
  const smallScreen = useMediaQuery(useTheme().breakpoints.only('xs'))
  const [confirmingKill, setConfirmingKill] = useState(false)

  const KillButton = (
    <Button
      startIcon={<Close />}
      variant='contained'
      color='default'
      onClick={() => {
        if (confirmingKill) {
          setConfirmingKill(false)
          stopStartServer('STOP')
        } else setConfirmingKill(true)
      }}
      fullWidth={smallScreen}
    >
      {confirmingKill ? 'Confirm Kill?' : 'Kill'}
    </Button>
  )

  const Buttons = (
    <>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <Button
          startIcon={<PlayArrow />}
          variant='contained'
          color='primary'
          onClick={async () => stopStartServer('START')}
          fullWidth={smallScreen}
        >
          Start
        </Button>
        <div style={{ margin: 10 }} />
        <Button
          variant='contained'
          color='primary'
          fullWidth={smallScreen}
          startIcon={<Stop />}
          onClick={() => {
            if (!ws) return
            ws.send('save-all')
            setTimeout(() => ws.send('end'), 1000)
            setTimeout(() => ws.send('stop'), 5000)
          }}
        >
          Stop
        </Button>
        {!smallScreen && <div style={{ margin: 10 }} />}
        {!smallScreen && KillButton}
      </div>
      {smallScreen && <div style={{ margin: 10 }} />}
      {smallScreen && KillButton}
    </>
  )

  return smallScreen ? (
    <Paper elevation={10} style={{ marginTop: 10, padding: 10 }}>
      {Buttons}
    </Paper>
  ) : (
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 10,
        padding: 10,
        width: '100%'
      }}
    >
      {Buttons}
    </div>
  )
}

export default ConsoleButtons
