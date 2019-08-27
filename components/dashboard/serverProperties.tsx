import React from 'react'
import { Typography, Paper, TextField, Button } from '@material-ui/core'

import { ip } from '../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../imports/connectionFailure'

interface S { // eslint-disable-next-line no-undef
  serverProperties?: { code: number, content: string }, listening: boolean, origContent?: string
}

export default class ServerProperties extends React.Component<{}, S> {
  constructor (props: {}) {
    super(props)
    this.state = { listening: false }
    this.save = this.save.bind(this)
  }

  async save () {
    try {
      const request = await (await fetch(`${ip}:4200/serverProperties/write`, {
        headers: { 'Access-Token': localStorage.getItem('accessToken') },
        body: this.state.serverProperties.content,
        method: 'POST'
      })).json()
      if (!request.success) console.warn('Unable to save server.properties!')
    } catch (e) { }
  }

  async componentDidMount () {
    try {
      // Fetch server properties.
      const serverProperties = await (await fetch(ip + ':4200/serverProperties', {
        headers: { 'Access-Token': localStorage.getItem('accessToken') }
      })).json()
      if (serverProperties.code === 401) throw new Error()
      this.setState({ serverProperties, origContent: serverProperties.content, listening: true })
    } catch (e) {}
  }

  render () {
    // Return the code.
    if (!this.state.listening || !this.state.serverProperties) return <ConnectionFailure />
    return (
      <>
        {/* server.properties */}
        <Paper style={{ padding: 20 }}>
          <Typography variant='h5' gutterBottom>server.properties</Typography>
          <div style={{ paddingBottom: 10 }} />
          <TextField multiline variant='outlined' fullWidth rowsMax={20}
            value={this.state.serverProperties.content}
            onChange={e => this.setState({
              serverProperties: { ...this.state.serverProperties, content: e.target.value }
            })}
          />
          <br /><div style={{ display: 'flex', marginTop: 10 }}>
            <Button variant='outlined' onClick={() => this.setState({
              serverProperties: { ...this.state.serverProperties, content: this.state.origContent }
            })}>Cancel</Button>
            <div style={{ flex: 1 }} />
            <Button variant='contained' color='secondary' onClick={this.save}>Save</Button>
          </div>
        </Paper>
      </>
    )
  }
}
