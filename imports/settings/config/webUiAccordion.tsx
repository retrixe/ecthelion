import React from 'react'
import {
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { defaultOctyneConfig } from './octyneConfig'

const WebUiConfigAccordionInternal = ({
  webUiEnabled,
  setWebUiEnabled,
  webUiPort,
  setWebUiPort,
}: {
  webUiEnabled: boolean
  setWebUiEnabled: (enabled: boolean) => void
  webUiPort: number
  setWebUiPort: (port: number) => void
}): React.JSX.Element => {
  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Web UI</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Enable Web UI'
            control={
              <Switch checked={webUiEnabled} onChange={e => setWebUiEnabled(e.target.checked)} />
            }
          />
          <br />
          <TextField
            size='small'
            value={webUiPort}
            label='Web UI Port'
            variant='outlined'
            onChange={e => {
              if (!isNaN(Number(e.target.value))) setWebUiPort(Number(e.target.value))
            }}
            disabled={!webUiEnabled}
            helperText={
              webUiPort < 1 || webUiPort > 65535
                ? 'This port number is invalid. Please enter a port number between 1 and 65535.'
                : `The port for the Web UI. Default: ${defaultOctyneConfig.webUI.port}`
            }
          />
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

const WebUiConfigAccordion = React.memo(WebUiConfigAccordionInternal)

export default WebUiConfigAccordion
