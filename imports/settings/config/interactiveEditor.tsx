import React, { useCallback, useEffect, useState } from 'react'
import { Typography, Button, LinearProgress } from '@mui/material'
import CommentJSON from 'comment-json'
import { isEqual } from 'lodash'
import { defaultOctyneConfig as defaultConfig, type OctyneConfig } from './octyneConfig'
import GeneralConfigAccordion from './generalAccordion'
import RedisConfigAccordion from './redisAccordion'
import HttpsConfigAccordion from './httpsAccordion'
import WebUiConfigAccordion from './webUiAccordion'
import UnixSocketConfigAccordion from './unixSocketAccordion'
import LoggingConfigAccordion from './loggingAccordion'
import ServerConfigAccordion from './serverAccordion'

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
  const [loggingActions, setLoggingActions] = useState<Record<string, boolean>>({})
  const [servers, setServers] = useState<NonNullable<OctyneConfig['servers']>>({})

  const error = port < 1 || port > 65535 || webUiPort < 1 || webUiPort > 65535

  const loadStateFromJSON = useCallback((): void => {
    const json = CommentJSON.parse(props.content) as OctyneConfig
    setPort(json.port ?? defaultConfig.port)
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
    setLoggingActions(json.logging?.actions ?? {})
    setServers(json.servers ?? {})
  }, [props.content])

  const saveFile = (): void => {
    setSaving(true)
    const json = CommentJSON.parse(props.content) as OctyneConfig

    if (port !== (json.port ?? defaultConfig.port)) json.port = port
    if (redisEnabled !== (json.redis?.enabled ?? false)) {
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
    if (httpsEnabled !== (json.https?.enabled ?? false)) {
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
    if (!isEqual(loggingActions, json.logging?.actions ?? {})) {
      json.logging ??= {}
      json.logging.actions ??= {}
      Object.assign(json.logging.actions, loggingActions)
    }
    // Remove any servers now gone, update existing servers
    for (const serverName in json.servers) {
      if (!(serverName in servers)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete json.servers[serverName]
      }
      if ((servers[serverName].enabled ?? true) !== (json.servers[serverName].enabled ?? true)) {
        json.servers[serverName].enabled = servers[serverName].enabled
      }
      if ((servers[serverName].directory ?? '') !== (json.servers[serverName].directory ?? '')) {
        json.servers[serverName].directory = servers[serverName].directory
      }
      if ((servers[serverName].command ?? '') !== (json.servers[serverName].command ?? '')) {
        json.servers[serverName].command = servers[serverName].command
      }
    }
    // Add any new servers
    if (Object.keys(servers).length > 0) {
      json.servers ??= {}
      for (const serverName in servers) {
        if (!(serverName in json.servers)) {
          json.servers[serverName] = servers[serverName]
        }
      }
    }

    const modifiedJson = CommentJSON.stringify(json, null, 2)
    console.log(modifiedJson) // TODO
    Promise.resolve(props.onSave(modifiedJson))
      .then(() => setSaving(false))
      .catch(console.error)
  }

  useEffect(() => loadStateFromJSON(), [loadStateFromJSON])

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
        <GeneralConfigAccordion port={port} setPort={setPort} />
        <RedisConfigAccordion
          redisEnabled={redisEnabled}
          setRedisEnabled={setRedisEnabled}
          redisUrl={redisUrl}
          setRedisUrl={setRedisUrl}
          redisRole={redisRole}
          setRedisRole={setRedisRole}
        />
        <WebUiConfigAccordion
          webUiEnabled={webUiEnabled}
          setWebUiEnabled={setWebUiEnabled}
          webUiPort={webUiPort}
          setWebUiPort={setWebUiPort}
        />
        <LoggingConfigAccordion
          loggingEnabled={loggingEnabled}
          setLoggingEnabled={setLoggingEnabled}
          loggingPath={loggingPath}
          setLoggingPath={setLoggingPath}
          loggingActions={loggingActions}
          setLoggingActions={setLoggingActions}
        />
        <UnixSocketConfigAccordion
          unixSocketEnabled={unixSocketEnabled}
          setUnixSocketEnabled={setUnixSocketEnabled}
          unixSocketLocation={unixSocketLocation}
          setUnixSocketLocation={setUnixSocketLocation}
          unixSocketGroup={unixSocketGroup}
          setUnixSocketGroup={setUnixSocketGroup}
        />
        <HttpsConfigAccordion
          httpsEnabled={httpsEnabled}
          setHttpsEnabled={setHttpsEnabled}
          httpsCert={httpsCert}
          setHttpsCert={setHttpsCert}
          httpsKey={httpsKey}
          setHttpsKey={setHttpsKey}
        />
        {Object.entries(servers).map(([server, serverData]) => (
          <ServerConfigAccordion
            key={server}
            serverName={server}
            serverData={serverData}
            servers={servers}
            setServers={setServers}
          />
        ))}
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
