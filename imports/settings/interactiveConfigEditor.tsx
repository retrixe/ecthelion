import React, { useState } from 'react'
import {
  Typography,
  Button,
  LinearProgress,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import CommentJSON from 'comment-json'

interface Config {
  port?: number
  unixSocket?: {
    enabled?: boolean
    location?: string
    group?: string
  }
  https?: {
    enabled?: boolean
    cert?: string
    key?: string
  }
  redis?: {
    enabled?: boolean
    url?: string
    role?: string
  }
  webUI?: {
    enabled?: boolean
    port?: number
  }
  servers?: Record<
    string,
    {
      enabled?: boolean // TODO
      directory?: string // TODO
      command?: string // TODO
    }
  >
  logging?: {
    enabled?: boolean
    path?: string
    actions?: Record<string, boolean> // TODO
  }
}

const defaultConfig = {
  port: 42069,
  unixSocket: {
    enabled: true,
  },
  redis: {
    url: 'redis://localhost',
    role: 'primary',
  },
  webUI: {
    enabled: true,
    port: 7877,
  },
  logging: {
    enabled: true,
    path: 'logs',
  },
}

// TODO: Refresh button.
const InteractiveConfigEditor = (props: {
  title: string
  content: string
  onSave: (content: string) => Promise<void> | void
}): React.JSX.Element => {
  const [saving, setSaving] = useState(false)

  const [port, setPort] = useState(defaultConfig.port)
  const [unixSocketEnabled, setUnixSocketEnabled] = useState(defaultConfig.unixSocket.enabled)
  const [unixSocketLocation, setUnixSocketLocation] = useState('')
  const [unixSocketGroup, setUnixSocketGroup] = useState('')
  const [httpsEnabled, setHttpsEnabled] = useState(false)
  const [httpsCert, setHttpsCert] = useState('')
  const [httpsKey, setHttpsKey] = useState('')
  const [redisEnabled, setRedisEnabled] = useState(false)
  const [redisUrl, setRedisUrl] = useState(defaultConfig.redis.url)
  const [redisRole, setRedisRole] = useState(defaultConfig.redis.role)
  const [webUiEnabled, setWebUiEnabled] = useState(defaultConfig.webUI.enabled)
  const [webUiPort, setWebUiPort] = useState(defaultConfig.webUI.port)
  const [loggingEnabled, setLoggingEnabled] = useState(defaultConfig.logging.enabled)
  const [loggingPath, setLoggingPath] = useState(defaultConfig.logging.path)

  const error = port < 1 || port > 65535 || webUiPort < 1 || webUiPort > 65535

  const loadStateFromJSON = (): void => {
    const json = CommentJSON.parse(props.content) as Config
    setPort(json.port ?? port)
    setUnixSocketEnabled(json.unixSocket?.enabled ?? defaultConfig.unixSocket.enabled)
    setUnixSocketLocation(json.unixSocket?.location ?? '')
    setUnixSocketGroup(json.unixSocket?.group ?? '')
    setHttpsEnabled(json.https?.enabled ?? false)
    setHttpsCert(json.https?.cert ?? '')
    setHttpsKey(json.https?.key ?? '')
    setRedisEnabled(json.redis?.enabled ?? false)
    setRedisUrl(json.redis?.url ?? defaultConfig.redis.url)
    setRedisRole(json.redis?.role ?? defaultConfig.redis.role)
    setWebUiEnabled(json.webUI?.enabled ?? defaultConfig.webUI.enabled)
    setWebUiPort(json.webUI?.port ?? defaultConfig.webUI.port)
    setLoggingEnabled(json.logging?.enabled ?? defaultConfig.logging.enabled)
    setLoggingPath(json.logging?.path ?? defaultConfig.logging.path)
  }

  const saveFile = (): void => {
    setSaving(true)
    const json = CommentJSON.parse(props.content) as Config

    if (port !== (json.port ?? defaultConfig.port)) json.port = port
    if (redisEnabled !== !!json.redis?.enabled) {
      json.redis ??= {}
      json.redis.enabled = redisEnabled
    }
    if (redisUrl !== (json.redis?.url ?? defaultConfig.redis.url)) {
      json.redis ??= {}
      json.redis.url = redisUrl
    }
    if (redisRole !== (json.redis?.role ?? defaultConfig.redis.role)) {
      json.redis ??= {}
      json.redis.role = redisRole
    }
    if (httpsEnabled !== !!json.https?.enabled) {
      json.https ??= {}
      json.https.enabled = httpsEnabled
    }
    if (httpsCert !== (json.https?.cert ?? '')) {
      json.https ??= {}
      json.https.cert = httpsCert
    }
    if (httpsKey !== (json.https?.key ?? '')) {
      json.https ??= {}
      json.https.key = httpsKey
    }
    if (webUiEnabled !== (json.webUI?.enabled ?? defaultConfig.webUI.enabled)) {
      json.webUI ??= {}
      json.webUI.enabled = webUiEnabled
    }
    if (webUiPort !== (json.webUI?.port ?? defaultConfig.webUI.port)) {
      json.webUI ??= {}
      json.webUI.port = webUiPort
    }
    if (unixSocketEnabled !== (json.unixSocket?.enabled ?? defaultConfig.unixSocket.enabled)) {
      json.unixSocket ??= {}
      json.unixSocket.enabled = unixSocketEnabled
    }
    if (unixSocketLocation !== (json.unixSocket?.location ?? '')) {
      json.unixSocket ??= {}
      json.unixSocket.location = unixSocketLocation
    }
    if (unixSocketGroup !== (json.unixSocket?.group ?? '')) {
      json.unixSocket ??= {}
      json.unixSocket.group = unixSocketGroup
    }
    if (loggingEnabled !== (json.logging?.enabled ?? defaultConfig.logging.enabled)) {
      json.logging ??= {}
      json.logging.enabled = loggingEnabled
    }
    if (loggingPath !== (json.logging?.path ?? defaultConfig.logging.path)) {
      json.logging ??= {}
      json.logging.path = loggingPath
    }

    const modifiedJson = CommentJSON.stringify(json, null, 2)
    console.log(modifiedJson) // TODO
    Promise.resolve(props.onSave(modifiedJson))
      .then(() => setSaving(false))
      .catch(console.error)
  }

  return (
    <>
      <Typography variant='h5' gutterBottom>
        {props.title}
      </Typography>
      <Typography
        variant='body2'
        color='textSecondary'
        gutterBottom
        style={{ marginBottom: '1rem' }}
      >
        Note: Some settings may not work with older versions of Octyne.
      </Typography>
      <div>
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
              onChange={e => setPort(Number(e.target.value))}
              helperText={
                port < 1 || port > 65535
                  ? 'This port number is invalid. Please enter a port number between 1 and 65535.'
                  : undefined
              }
            />
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={2}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography component='span'>Redis-based Authentication</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                label='Enable Redis Authentication'
                control={
                  <Switch
                    color='info'
                    checked={redisEnabled}
                    onChange={e => setRedisEnabled(e.target.checked)}
                  />
                }
              />
              <br />
              <TextField
                size='small'
                value={redisUrl}
                label='Logs Folder'
                variant='outlined'
                onChange={e => setRedisUrl(e.target.value)}
                disabled={!redisEnabled}
                helperText={'The URL of the Redis server. Default: ' + defaultConfig.redis.url}
              />
              <br />
              <FormControl>
                <InputLabel id='redis-role-label' color='secondary'>
                  Role
                </InputLabel>
                <Select
                  labelId='redis-role-label'
                  id='redis-role-select'
                  value={redisRole}
                  label='Role'
                  onChange={e => setRedisRole(e.target.value)}
                  disabled={!redisEnabled}
                  color='secondary'
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
        <Accordion elevation={2}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography component='span'>Web UI</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                label='Enable Web UI'
                control={
                  <Switch
                    color='info'
                    checked={webUiEnabled}
                    onChange={e => setWebUiEnabled(e.target.checked)}
                  />
                }
              />
              <br />
              <TextField
                size='small'
                value={webUiPort}
                label='Web UI Port'
                variant='outlined'
                onChange={e => setWebUiPort(Number(e.target.value))}
                disabled={!webUiEnabled}
                helperText={
                  webUiPort < 1 || webUiPort > 65535
                    ? 'This port number is invalid. Please enter a port number between 1 and 65535.'
                    : `The port for the Web UI. Default: ${defaultConfig.webUI.port}`
                }
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
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
                  'Path to folder to store logs in. Default: ' + defaultConfig.logging.path
                }
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
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
                    color='info'
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
        <Accordion elevation={2}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography component='span'>HTTPS</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                label='Enable HTTPS'
                control={
                  <Switch
                    color='info'
                    checked={httpsEnabled}
                    onChange={e => setHttpsEnabled(e.target.checked)}
                  />
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
      </div>
      <div style={{ display: 'flex', marginTop: 20 }}>
        <Button variant='outlined' onClick={loadStateFromJSON}>
          Undo Changes
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving || error} color='secondary' onClick={saveFile}>
          Apply
        </Button>
      </div>
      {saving && (
        <div style={{ paddingTop: 10 }}>
          <LinearProgress color='secondary' />
        </div>
      )}
    </>
  )
}

export default InteractiveConfigEditor
