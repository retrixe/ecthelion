import React, { useState, useEffect } from 'react'
import { Typography, Paper, TextField, Button } from '@material-ui/core'

import { ip } from '../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../imports/connectionFailure'

interface S {
  path: string,
  listening: boolean,
  serverProperties?: { code: number, content: string },
  files?: Array<{ folder: boolean, name: string, size: number, lastModified: number }>
}

const Files = (props: { server: string }) => {
  const [listening, setListening] = useState(false)
  const [path] = useState('/')
  const [files, setFiles] = useState(null)
  // componentDidMount
  const componentDidMount = async () => {
    const files = await (await fetch(`${ip}/server/${props.server}/files?path=${path}`, {
      headers: { 'Authorization': localStorage.getItem('token') }
    })).json()
    if (files) {
      setFiles(files.contents)
      setListening(true)
    }
  }
  useEffect(() => { componentDidMount() }, [])
  // Return the code.
  if (!listening || !files) return <ConnectionFailure />
  return (
    <>
      {/* server.properties */}
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>server.properties</Typography>
        <Typography variant='h5' gutterBottom>{path}</Typography>
        <Typography>{files.toString()}</Typography>
        <div style={{ paddingBottom: 10 }} />
        <TextField multiline variant='outlined' fullWidth rowsMax={20} value={''} />
        <br /><div style={{ display: 'flex', marginTop: 10 }}>
          <Button variant='outlined'>Cancel</Button>
          <div style={{ flex: 1 }} />
          <Button variant='contained' color='secondary'>Save</Button>
        </div>
      </Paper>
    </>
  )
}

export default Files

/*
export default class Files extends React.Component<{ server: string }, S> {
  constructor (props: { server: string }) {
    super(props)
    this.state = { listening: false, path: '/', serverProperties: { code: 200, content: 'hi' } }
    this.save = this.save.bind(this)
  }

  async save () {
    try {
      const request = await (await fetch(`${ip}/serverProperties/write`, {
        headers: { 'Access-Token': localStorage.getItem('accessToken') },
        // body: this.state.serverProperties.content,
        method: 'POST'
      })).json()
      if (!request.success) console.warn('Unable to save server.properties!')
    } catch (e) { }
  }

  async componentDidMount () {
    try {
      // Fetch files.
      const files = await (await fetch(`${ip}/server/${this.props.server}/files?path=${this.state.path}`, {
        headers: { 'Authorization': localStorage.getItem('token') }
      })).json()
      if (!files) throw new Error()
      this.setState({ files: files.contents, listening: true })
    } catch (e) { }
  }

  render () {
    // Return the code.
    if (!this.state.listening || !this.state.files) return <ConnectionFailure />
    return (
      <>
        {/* server.properties *\/}
        <Paper style={{ padding: 20 }}>
          {this.state.files.toString()}
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
              serverProperties: { ...this.state.serverProperties }
            })}>Cancel</Button>
            <div style={{ flex: 1 }} />
            <Button variant='contained' color='secondary' onClick={this.save}>Save</Button>
          </div>
        </Paper>
      </>
    )
  }
}
*/
