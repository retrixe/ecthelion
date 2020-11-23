import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import { Paper, Typography, Divider } from '@material-ui/core'

import Title from '../../../imports/helpers/title'
import Message from '../../../imports/helpers/message'
import AuthFailure from '../../../imports/errors/authFailure'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

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
  if (units.days === 1) res += units.days + ' day '
  else if (units.days) res += units.days + ' days '
  if (units.hours === 1) res += units.hours + ' hour '
  else if (units.hours) res += units.hours + ' hours '
  if (units.minutes === 1) res += units.minutes + ' minute '
  else if (units.minutes) res += units.minutes + ' minutes '
  if (units.seconds === 1) res += units.seconds + ' second '
  else if (units.seconds) res += units.seconds + ' seconds '
  return res.trimRight()
}

interface ServerStatus {
  status: 0 | 1 | 2,
  uptime: number,
  cpuUsage: number,
  memoryUsage: number,
  totalMemory: number
}

const Statistics = () => {
  const [message, setMessage] = useState('')
  const [listening, setListening] = useState<boolean|null>(null)
  const [statistics, setStatistics] = useState<ServerStatus | null>(null)
  const [authenticated, setAuthenticated] = useState(true)

  const router = useRouter()
  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

  // Check if the user is authenticated.
  useEffect(() => { authWrapperCheck().then(e => setAuthenticated(e || false)) }, [])
  useEffect(() => {
    if (!router.query.server) return
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => {
      try {
        // Fetch server properties.
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch(
          `${serverIp}/server/${router.query.server}`,
          { headers: { Authorization: token } }
        )
        if (res.status === 401) throw new Error()
        else if (res.ok) {
          setListening(true)
          setStatistics(await res.json())
        }
      } catch (e) { setListening(false) }
    }, 1000)
    return () => clearInterval(interval)
  }, [serverIp, router.query.server])

  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Statistics - Ecthelion'
        description='The statistics of a process running on Octyne.'
        url={`/dashboard/${router.query.server}`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!authenticated ? <AuthFailure /> : (
            (!listening || !statistics) ? <ConnectionFailure loading={listening === null} /> : (
              <Paper style={{ padding: 20 }}>
                <Typography variant='h4' gutterBottom>Process Statistics</Typography>
                <Divider />
                <div style={{ paddingBottom: 10 }} />
                <Typography variant='h6'>Status</Typography>
                <Typography variant='subtitle1' gutterBottom>
                  {statistics && statistics.status === 0 ? 'Offline'
                    : (statistics && statistics.status === 1 ? 'Online' : 'Crashed')}
                </Typography>
                <Typography variant='h6'>Uptime</Typography>
                <Typography variant='subtitle1' gutterBottom>
                  {statistics && statistics.uptime ? parseDuration(statistics.uptime) : 'N/A'}
                </Typography>
                {/*
                <Divider />
                <div style={{ paddingBottom: 10 }} />
                <Typography variant='h6'>CPU Usage</Typography>
                <Typography gutterBottom>{statistics.cpuUsage}%</Typography>
                <LinearProgress variant='determinate' value={statistics.cpuUsage} />
                <br />
                <Typography variant='h6'>RAM Usage</Typography>
                <Typography gutterBottom>
                  {Math.round(statistics.memoryUsage / 1024 / 1024)} MB /{' '}
                  {Math.round(statistics.totalMemory / 1024 / 1024)} MB
                </Typography>
                <LinearProgress
                  variant='determinate' color='secondary' value={
                    statistics.memoryUsage * 100 / statistics.totalMemory
                  }
                />
                */}
                {message && <Message message={message} setMessage={setMessage} />}
              </Paper>
            )
          )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Statistics
