import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'

const HttpsConfigAccordionInternal = ({
  httpsEnabled,
  setHttpsEnabled,
  httpsCert,
  setHttpsCert,
  httpsKey,
  setHttpsKey,
}: {
  httpsEnabled: boolean
  setHttpsEnabled: (enabled: boolean) => void
  httpsCert: string
  setHttpsCert: (cert: string) => void
  httpsKey: string
  setHttpsKey: (key: string) => void
}): React.JSX.Element => {
  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>HTTPS</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Enable HTTPS'
            control={
              <Switch checked={httpsEnabled} onChange={e => setHttpsEnabled(e.target.checked)} />
            }
          />
          <br />
          <TextField
            size='small'
            value={httpsCert}
            label='HTTPS Certificate'
            variant='outlined'
            onChange={e => setHttpsCert(e.target.value)}
            disabled={!httpsEnabled}
            helperText='The path to the HTTPS certificate.'
          />
          <br />
          <TextField
            size='small'
            value={httpsKey}
            label='HTTPS Key'
            variant='outlined'
            onChange={e => setHttpsKey(e.target.value)}
            disabled={!httpsEnabled}
            helperText='The path to the HTTPS key.'
          />
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

const HttpsConfigAccordion = React.memo(HttpsConfigAccordionInternal)

export default HttpsConfigAccordion
