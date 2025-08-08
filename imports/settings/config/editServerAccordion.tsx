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
  AccordionActions,
  Button,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import type { OctyneServerConfig, OctyneConfig } from './octyneConfig'

const EditServerConfigAccordionInternal = ({
  serverName,
  serverData,
  setServers,
}: {
  serverName: string
  serverData: OctyneServerConfig
  setServers: React.Dispatch<React.SetStateAction<NonNullable<OctyneConfig['servers']>>>
}): React.JSX.Element => {
  const handleServerEnabledChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setServers(prev => ({ ...prev, [serverName]: { ...serverData, enabled: e.target.checked } }))
  }

  const handleServerDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setServers(prev => ({ ...prev, [serverName]: { ...serverData, directory: e.target.value } }))
  }

  const handleServerCommandChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setServers(prev => ({ ...prev, [serverName]: { ...serverData, command: e.target.value } }))
  }

  const handleServerDelete = (): void => {
    setServers(prev => {
      const newServers = { ...prev }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newServers[serverName]
      return newServers
    })
  }

  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Server: {serverName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Auto-start server'
            control={
              <Switch checked={serverData.enabled ?? true} onChange={handleServerEnabledChange} />
            }
          />
          <br />
          <TextField
            size='small'
            value={serverData.directory ?? ''}
            label='Directory'
            variant='outlined'
            onChange={handleServerDirectoryChange}
            helperText='The working directory of the server.'
          />
          <br />
          <TextField
            size='small'
            value={serverData.command ?? ''}
            label='Command'
            variant='outlined'
            onChange={handleServerCommandChange}
            helperText='The command to run to start this server.'
          />
        </FormGroup>
      </AccordionDetails>
      <AccordionActions>
        <Button color='error' onClick={handleServerDelete}>
          Delete Server
        </Button>
      </AccordionActions>
    </Accordion>
  )
}

const EditServerConfigAccordion = React.memo(EditServerConfigAccordionInternal)

export default EditServerConfigAccordion
