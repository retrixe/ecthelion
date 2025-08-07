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
  Divider,
  List,
  ListItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Add, Clear, ExpandMore } from '@mui/icons-material'
import { defaultOctyneConfig } from './octyneConfig'

const LoggingConfigAccordionInternal = ({
  loggingEnabled,
  setLoggingEnabled,
  loggingPath,
  setLoggingPath,
  loggingActions,
  setLoggingActions,
}: {
  loggingEnabled: boolean
  setLoggingEnabled: (enabled: boolean) => void
  loggingPath: string
  setLoggingPath: (path: string) => void
  loggingActions: Record<string, boolean>
  setLoggingActions: (actions: Record<string, boolean>) => void
}): React.JSX.Element => {
  const [newLoggingAction, setNewLoggingAction] = useState('')

  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Logging</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Log actions performed on Octyne'
            control={
              <Switch
                color='info'
                checked={loggingEnabled}
                onChange={e => setLoggingEnabled(e.target.checked)}
              />
            }
          />
          <br />
          <TextField
            size='small'
            value={loggingPath}
            label='Logs Folder'
            variant='outlined'
            onChange={e => setLoggingPath(e.target.value)}
            disabled={!loggingEnabled}
            helperText={
              'Path to folder to store logs in. Default: ' + defaultOctyneConfig.logging.path
            }
          />
          <br />
          <Divider />
          <br />
          <Typography variant='h6' gutterBottom>
            Configure what actions should be logged
          </Typography>
          <Typography variant='body2' color='textSecondary' gutterBottom>
            A list of action types can be found in the Octyne documentation:{' '}
            <Typography
              component='a'
              variant='body2'
              color='primary'
              href='https://github.com/retrixe/octyne#logging'
              target='_blank'
              rel='noopener noreferrer'
            >
              https://github.com/retrixe/octyne#logging
            </Typography>
          </Typography>
          <List>
            {Object.entries(loggingActions).map(([action, enabled]) => (
              <ListItem
                key={action}
                secondaryAction={
                  <IconButton
                    edge='end'
                    onClick={() => {
                      const updatedActions = { ...loggingActions }
                      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                      delete updatedActions[action]
                      setLoggingActions(updatedActions)
                    }}
                    disabled={!loggingEnabled}
                  >
                    <Clear />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <Switch
                    color='info'
                    checked={enabled}
                    onChange={e =>
                      setLoggingActions({
                        ...loggingActions,
                        [action]: e.target.checked,
                      })
                    }
                  />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <TextField
              size='small'
              value={newLoggingAction}
              onChange={e => setNewLoggingAction(e.target.value)}
              label='Add New Action'
              variant='outlined'
              disabled={!loggingEnabled}
              helperText='Include/exclude an action from logging e.g. config.view'
            />
            <IconButton
              onClick={() => {
                if (newLoggingAction && !loggingActions[newLoggingAction]) {
                  setLoggingActions({ ...loggingActions, [newLoggingAction]: true })
                }
                setNewLoggingAction('')
              }}
              disabled={!loggingEnabled}
            >
              <Add />
            </IconButton>
          </div>
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

const LoggingConfigAccordion = React.memo(LoggingConfigAccordionInternal)

export default LoggingConfigAccordion
