import React, { useState } from 'react'
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
import type { OctyneConfig, OctyneServerConfig } from './octyneConfig'

const AddServerConfigAccordionInternal = ({
  servers,
  onServerCreate,
}: {
  servers: NonNullable<OctyneConfig['servers']>
  onServerCreate: (name: string, server: OctyneServerConfig) => void
}): React.JSX.Element => {
  const [name, setName] = useState<[string, string | null]>(['', null])
  const [directory, setDirectory] = useState<[string, string | null]>(['', null])
  const [command, setCommand] = useState<[string, string | null]>(['', null])
  const [enabled, setEnabled] = useState(true)

  const handleServerCreate = (): void => {
    if (!name[0]) return setName([name[0], 'Server name cannot be empty.'])
    if (!directory[0]) return setDirectory([directory[0], 'Directory cannot be empty.'])
    if (!command[0]) return setCommand([command[0], 'Command cannot be empty.'])
    if (name[0] in servers) return setName([name[0], 'A server with this name already exists!'])
    const newServer: OctyneServerConfig = {
      enabled,
      directory: directory[0],
      command: command[0],
    }
    onServerCreate(name[0], newServer)
    setName(['', null])
    setDirectory(['', null])
    setCommand(['', null])
    setEnabled(true)
  }

  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Add Server</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <TextField
            size='small'
            value={name[0]}
            label='Name'
            variant='outlined'
            onChange={e => setName([e.target.value, null])}
            helperText={name[1] ?? 'The name of the server.'}
            error={!!name[1]}
          />
          <br />
          <FormControlLabel
            label='Auto-start server'
            control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} />}
          />
          <br />
          <TextField
            size='small'
            value={directory[0]}
            label='Directory'
            variant='outlined'
            onChange={e => setDirectory([e.target.value, null])}
            helperText={directory[1] ?? 'The working directory of the server.'}
            error={!!directory[1]}
          />
          <br />
          <TextField
            size='small'
            value={command[0]}
            label='Command'
            variant='outlined'
            onChange={e => setCommand([e.target.value, null])}
            helperText={command[1] ?? 'The command to run to start this server.'}
            error={!!command[1]}
          />
        </FormGroup>
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={handleServerCreate}>Create Server</Button>
      </AccordionActions>
    </Accordion>
  )
}

const AddServerConfigAccordion = React.memo(AddServerConfigAccordionInternal)

export default AddServerConfigAccordion
