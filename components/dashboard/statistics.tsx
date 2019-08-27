import React from 'react'
import {
  Typography, Paper, Divider, LinearProgress
} from '@material-ui/core'
import { duration } from 'moment'

import { ip } from '../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../imports/connectionFailure'

interface Stats {
  code: number, online: boolean, maxPlayers: number, playersOnline: number, versionName: string,
  onlineSince: number, totalMemory: number, memoryUsed: number, cpuUsage: number
}

interface S { // eslint-disable-next-line no-undef
  statistics?: Stats, listening: boolean, interval?: NodeJS.Timeout
}

export default class Statistics extends React.Component<{}, S> {
  constructor (props: {}) {
    super(props)
    this.state = { listening: false }
  }

  async componentDidMount () {
    try {
      // Fetch statistics.
      try {
        const statistics = await (await fetch(ip + ':4200/statistics', {
          headers: { 'Access-Token': localStorage.getItem('accessToken') }
        })).json()
        if (statistics.code === 401) throw new Error()
        this.setState({ statistics, listening: true })
      } catch (e) {}
      // Set an interval of 2 seconds to repeatedly update the statistics.
      const interval = setInterval(async () => {
        // Try to access the server.
        try {
          // Update the status.
          const statistics = await (await fetch(ip + ':4200/statistics', {
            headers: { 'Access-Token': localStorage.getItem('accessToken') }
          })).json()
          // If unauthorized, throw an error right now.
          // This will be handled later.
          if (statistics.code === 401) throw new Error()
          this.setState({ statistics, listening: true })
        } catch (e) {
          // We set listening to false.
          this.setState({ listening: false })
        }
        // Should happen every 2 seconds.
      }, 2000)
      // This can be server-side rendering error so we won't log on catch.
      // Client side rendering will alert the user anyways.
      // We set the interval in state to unregister it later..
      this.setState({ interval })
    } catch (e) {}
  }

  // Clear interval on timeout.
  componentWillUnmount () { clearInterval(this.state.interval) }

  render () {
    // Return the code.
    if (!this.state.listening || !this.state.statistics) return <ConnectionFailure />
    const normalisedMemory = () => (
      this.state.statistics.memoryUsed * 100 / this.state.statistics.totalMemory
    )
    // Calculate uptime string.
    const d = duration(Date.now() - this.state.statistics.onlineSince)
    let upt: string
    const days = Math.floor(d.asDays())
    if (days) upt = `${days} days ${d.hours()} hours ${d.minutes()} minutes ${d.seconds()} seconds`
    else if (d.hours()) upt = `${d.hours()} hours ${d.minutes()} minutes ${d.seconds()} seconds`
    else if (d.minutes()) upt = `${d.minutes()} minutes ${d.seconds()} seconds`
    else upt = `${d.seconds()} seconds`
    return (
      <>
        {/* Information about the server. */}
        <Paper style={{ padding: 10 }}>
          <Typography variant='h4' gutterBottom>Information</Typography>
          <Divider /><div style={{ paddingBottom: 10 }} />
          <Typography variant='h6'>Server Version</Typography>
          <Typography gutterBottom>{this.state.statistics.versionName}</Typography>
          <Typography variant='h6'>Players Online</Typography><Typography gutterBottom>
            {this.state.statistics.playersOnline}/{this.state.statistics.maxPlayers}
          </Typography>
          <Typography variant='h6'>Server Uptime</Typography><Typography>{upt}</Typography>
        </Paper><div style={{ marginBottom: 30 }} />
        {/* Performance statistics. */}
        <Paper style={{ padding: 10 }}>
          <Typography variant='h4' gutterBottom>Performance</Typography>
          <Divider /><div style={{ paddingBottom: 10 }} />

          <Typography variant='h6'>CPU Usage</Typography>
          <Typography gutterBottom>{this.state.statistics.cpuUsage}%</Typography>
          <LinearProgress variant='determinate' value={this.state.statistics.cpuUsage} />
          <br />
          <Typography variant='h6'>RAM Usage</Typography><Typography gutterBottom>
            {Math.round(this.state.statistics.memoryUsed / 1024 / 1024)} MB /{' '}
            {Math.round(this.state.statistics.totalMemory / 1024 / 1024)} MB
          </Typography>
          <LinearProgress variant='determinate' color='secondary' value={normalisedMemory()} />
        </Paper>
      </>
    )
  }
}
