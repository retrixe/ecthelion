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

const UnixSocketConfigAccordionInternal = ({
  unixSocketEnabled,
  setUnixSocketEnabled,
  unixSocketLocation,
  setUnixSocketLocation,
  unixSocketGroup,
  setUnixSocketGroup,
}: {
  unixSocketEnabled: boolean
  setUnixSocketEnabled: (enabled: boolean) => void
  unixSocketLocation: string
  setUnixSocketLocation: (location: string) => void
  unixSocketGroup: string
  setUnixSocketGroup: (group: string) => void
}): React.JSX.Element => {
  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Unix Socket API</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Enable Unix Socket API'
            control={
              <Switch
                checked={unixSocketEnabled}
                onChange={e => setUnixSocketEnabled(e.target.checked)}
              />
            }
          />
          <br />
          <TextField
            size='small'
            value={unixSocketLocation}
            label='Unix Socket Location'
            variant='outlined'
            onChange={e => setUnixSocketLocation(e.target.value)}
            disabled={!unixSocketEnabled}
            helperText='The location of the Unix socket.'
          />
          <br />
          <TextField
            size='small'
            value={unixSocketGroup}
            label='Unix Socket Group'
            variant='outlined'
            onChange={e => setUnixSocketGroup(e.target.value)}
            disabled={!unixSocketEnabled}
            helperText='The group of the Unix socket.'
          />
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

const UnixSocketConfigAccordion = React.memo(UnixSocketConfigAccordionInternal)

export default UnixSocketConfigAccordion
