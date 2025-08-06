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

const ServerConfigAccordionInternal = ({
  serverName,
  serverData,
  servers,
  setServers,
}: {
  serverName: string
  serverData: OctyneServerConfig
  servers: NonNullable<OctyneConfig['servers']>
  setServers: (servers: NonNullable<OctyneConfig['servers']>) => void
}): React.JSX.Element => {
  const handleServerEnabledChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newServerData = { ...serverData }
    newServerData.enabled = e.target.checked
    const newServers = { ...servers }
    newServers[serverName] = newServerData
    setServers(newServers)
  }

  const handleServerDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newServerData = { ...serverData }
    newServerData.directory = e.target.value
    const newServers = { ...servers }
    newServers[serverName] = newServerData
    setServers(newServers)
  }

  const handleServerCommandChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newServerData = { ...serverData }
    newServerData.command = e.target.value
    const newServers = { ...servers }
    newServers[serverName] = newServerData
    setServers(newServers)
  }

  const handleServerDelete = (): void => {
    const newServers = { ...servers }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newServers[serverName]
    setServers(newServers)
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
              <Switch
                color='info'
                checked={serverData.enabled ?? true}
                onChange={handleServerEnabledChange}
              />
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

const ServerConfigAccordion = React.memo(ServerConfigAccordionInternal)

export default ServerConfigAccordion
