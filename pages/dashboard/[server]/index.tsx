import React, { useState, useCallback } from 'react'

import { Paper, Typography, Divider, LinearProgress } from '@mui/material'

import useInterval from '../../../imports/helpers/useInterval'
import useKy from '../../../imports/helpers/useKy'
import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

const parseDuration = (durationNano: number): string => {
  const duration = durationNano / 1000000 // Convert to milliseconds
  const units = { days: 0, hours: 0, minutes: 0, seconds: 0 }
  units.days = Math.floor(duration / (24 * 60 * 60 * 1000))
  const leftoverHours = duration % (24 * 60 * 60 * 1000)
  units.hours = Math.floor(leftoverHours / (60 * 60 * 1000))
  const leftoverMinutes = duration % (60 * 60 * 1000)
  units.minutes = Math.floor(leftoverMinutes / (60 * 1000))
  const leftoverSeconds = duration % (60 * 1000)
  units.seconds = Math.floor(leftoverSeconds / 1000)

  let res = ''
  if (units.days === 1) res += `${units.days} day `
  else if (units.days) res += `${units.days} days `
  if (units.hours === 1) res += `${units.hours} hour `
  else if (units.hours) res += `${units.hours} hours `
  if (units.minutes === 1) res += `${units.minutes} minute `
  else if (units.minutes) res += `${units.minutes} minutes `
  if (units.seconds === 1) res += `${units.seconds} second `
  else if (units.seconds) res += `${units.seconds} seconds `
  return res.trimEnd()
}

interface Statistics {
  status: 0 | 1 | 2
  uptime: number
  cpuUsage: number
  memoryUsage: number
  totalMemory: number
  toDelete?: boolean
}

const StatisticsDisplay = ({
  server,
  statistics,
}: {
  server: string
  statistics: Statistics
}): React.JSX.Element => (
  <Paper style={{ padding: 20 }}>
    <Typography variant='h5' gutterBottom>
      Process Statistics - {server}
    </Typography>
    <Divider />
    <div style={{ paddingBottom: 10 }} />
    <Typography variant='h6'>Status</Typography>
    <Typography variant='subtitle1' gutterBottom>
      {statistics.status === 0 ? 'Offline' : statistics.status === 1 ? 'Online' : 'Crashed'}
      {statistics.toDelete ? ' (marked for deletion)' : ''}
    </Typography>
    <Typography variant='h6'>Uptime</Typography>
    <Typography variant='subtitle1' gutterBottom>
      {statistics.uptime ? parseDuration(statistics.uptime) : 'N/A'}
    </Typography>
    <Divider />
    <div style={{ paddingBottom: 10 }} />
    <Typography variant='h6'>CPU Usage</Typography>
    <Typography gutterBottom>{Math.ceil(statistics.cpuUsage)}%</Typography>
    <LinearProgress
      variant='determinate'
      color='secondary'
      value={Math.ceil(statistics.cpuUsage)}
    />
    <br />
    <Typography variant='h6'>RAM Usage</Typography>
    <Typography gutterBottom>
      {Math.round(statistics.memoryUsage / 1024 / 1024)} MB /{' '}
      {Math.round(statistics.totalMemory / 1024 / 1024)} MB
    </Typography>
    <LinearProgress
      variant='determinate'
      color='secondary'
      value={(statistics.memoryUsage * 100) / statistics.totalMemory}
    />
  </Paper>
)

const StatisticsPage = (): React.JSX.Element => {
  const { node, server, nodeExists } = useOctyneData()
  const ky = useKy(node)

  const [listening, setListening] = useState<boolean | null>(null)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [serverExists, setServerExists] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)

  // Check if the user is authenticated.
  const loadStatistics = useCallback(() => {
    if (!server || !nodeExists) return
    ;(async () => {
      // Fetch server stats.
      const res = await ky.get(`server/${server}`)
      if (res.ok) {
        setListening(true)
        setServerExists(true)
        setAuthenticated(true)
        setStatistics(await res.json())
        return
      } else if (res.status === 401) setAuthenticated(false)
      else if (res.status === 404) setServerExists(false)
      setListening(false)
    })().catch(() => setListening(false))
  }, [ky, server, nodeExists])
  useInterval(loadStatistics, 1000)

  return (
    <React.StrictMode>
      <Title
        title={`Statistics${server ? ' - ' + server : ''} - Ecthelion`}
        description='The statistics of a process running on Octyne.'
        url={`/dashboard/${server}`}
      />
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        {!nodeExists || !serverExists ? (
          <NotExistsError node={!nodeExists} />
        ) : !authenticated ? (
          <AuthFailure />
        ) : !listening || !statistics ? (
          <ConnectionFailure loading={listening === null} />
        ) : (
          <StatisticsDisplay server={server ?? ''} statistics={statistics} />
        )}
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default StatisticsPage
