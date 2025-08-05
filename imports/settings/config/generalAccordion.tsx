import React from 'react'
import { Typography, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

const GeneralConfigAccordionInternal = ({
  port,
  setPort,
}: {
  port: number
  setPort: (port: number) => void
}): React.JSX.Element => {
  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>General</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          size='small'
          value={port}
          error={port < 1 || port > 65535}
          label='Port'
          variant='outlined'
          onChange={e => {
            if (!isNaN(Number(e.target.value))) setPort(Number(e.target.value))
          }}
          helperText={
            port < 1 || port > 65535
              ? 'This port number is invalid. Please enter a port number between 1 and 65535.'
              : undefined
          }
        />
      </AccordionDetails>
    </Accordion>
  )
}

const GeneralConfigAccordion = React.memo(GeneralConfigAccordionInternal)

export default GeneralConfigAccordion
