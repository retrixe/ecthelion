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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { defaultOctyneConfig } from './octyneConfig'

const RedisConfigAccordionInternal = ({
  redisEnabled,
  setRedisEnabled,
  redisUrl,
  setRedisUrl,
  redisRole,
  setRedisRole,
}: {
  redisEnabled: boolean
  setRedisEnabled: (enabled: boolean) => void
  redisUrl: string
  setRedisUrl: (url: string) => void
  redisRole: string
  setRedisRole: (role: string) => void
}): React.JSX.Element => {
  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component='span'>Redis-based Authentication</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          <FormControlLabel
            label='Enable Redis-based Authentication'
            control={
              <Switch checked={redisEnabled} onChange={e => setRedisEnabled(e.target.checked)} />
            }
          />
          <br />
          <TextField
            size='small'
            value={redisUrl}
            label='URL'
            variant='outlined'
            onChange={e => setRedisUrl(e.target.value)}
            disabled={!redisEnabled}
            helperText={'The URL of the Redis server. Default: ' + defaultOctyneConfig.redis.url}
          />
          <br />
          <FormControl>
            <InputLabel id='redis-role-label'>Role</InputLabel>
            <Select
              labelId='redis-role-label'
              id='redis-role-select'
              value={redisRole}
              label='Role'
              onChange={e => setRedisRole(e.target.value)}
              disabled={!redisEnabled}
              size='small'
            >
              <MenuItem value='primary'>Primary (Authenticates users)</MenuItem>
              <MenuItem value='secondary'>
                Secondary (Requests authentication from primary node)
              </MenuItem>
            </Select>
          </FormControl>
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

const RedisConfigAccordion = React.memo(RedisConfigAccordionInternal)

export default RedisConfigAccordion
