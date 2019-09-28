import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, IconButton, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  CircularProgress, ListItemSecondaryAction, Menu, MenuItem
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import Folder from '@material-ui/icons/Folder'
import InsertDriveFile from '@material-ui/icons/InsertDriveFile'
import MoreVert from '@material-ui/icons/MoreVert'

import { ip } from '../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../imports/connectionFailure'

// Consider react-virtualized.

const Files = (props: { server: string }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState('')
  const [listening, setListening] = useState(false)
  const [path, setPath] = useState('/')
  const [files, setFiles] = useState<{
    folder: boolean, name: string, lastModified: number, size: number
  }[]>(null)
  const [fetching, setFetching] = useState(false)

  // componentDidMount
  useEffect(() => {
    (async () => {
      setFetching(true) // TODO: Make it show up after 1.0 seconds.
      const files = await (await fetch(`${ip}/server/${props.server}/files?path=${path}`, {
        headers: { Authorization: localStorage.getItem('token') }
      })).json()
      if (files) {
        setFiles(files.contents)
        setListening(true)
      }
      setFetching(false)
    })()
  }, [path, menuOpen, props.server])

  // Return the code.
  if (!listening || !files) return <ConnectionFailure />
  const fileSort = (a: string, b: string) => a === b ? 0 : (a > b ? 1 : -1)
  const rtd = (num: number) => Math.round(num * 100) / 100
  const bytesToGb = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < (1024 * 1024)) return rtd(bytes / 1024) + ' KB'
    else if (bytes < (1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024)) + ' MB'
    else if (bytes < (1024 * 1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024 * 1024)) + ' GB'
  }
  return (
    <>
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>Files - {props.server}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
          <IconButton onClick={() => {
            if (path !== '/') setPath(path.substring(0, path.lastIndexOf('/', path.length - 2) + 1))
          }}>
            <ArrowBack />
          </IconButton>
          <div style={{ padding: 10 }} />
          <Typography variant='h5'>{path}</Typography>
          <div style={{ padding: 10 }} />
          {fetching ? <CircularProgress color='secondary' /> : ''}
        </div>
        <Divider />
        <div style={{ paddingBottom: 10 }} />
        {/* List of files and folders. */}
        <List>
          {files.length ? files.sort(
            (a, b) => fileSort(a.name.toLowerCase(), b.name.toLowerCase())
          ).sort((a, b) => a.folder && b.folder ? 0 : (a.folder && !b.folder ? -1 : 1)).map(file => (
            <ListItem key={file.name} dense button onClick={() => {
              file.folder
                ? setPath(path + file.name + '/')
                // TODO: Authentication will break this.
                : window.location.href = `${ip}/server/${props.server}/file?path=${path}/${file.name}`
            }}>
              <ListItemAvatar>
                <Avatar>{file.folder ? <Folder /> : <InsertDriveFile />}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={file.name}
                secondary={
                  'Last modified on ' +
                  new Date(file.lastModified * 1000).toISOString().substr(0, 19).replace('T', ' ') +
                  ' | Size: ' + bytesToGb(file.size)
                } />
              <ListItemSecondaryAction>
                <IconButton onClick={e => {
                  setMenuOpen(file.name)
                  setAnchorEl(e.currentTarget)
                }}><MoreVert /></IconButton>
                <Menu keepMounted
                  anchorEl={anchorEl}
                  onClose={() => setMenuOpen('')}
                  open={menuOpen === file.name}
                >
                  <MenuItem onClick={async () => {
                    setFetching(true)
                    await (await fetch(`${ip}/server/${props.server}/file?path=${path}/${file.name}`, {
                      headers: { Authorization: localStorage.getItem('token') },
                      method: 'DELETE'
                    })).json()
                    setFetching(false)
                    setMenuOpen('')
                  }}>Delete</MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
          )) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
          {/*
          {files.length ? files.sort(
            (a, b) => fileSort(a.name.toLowerCase(), b.name.toLowerCase())
          ).filter(file => !file.folder).map(file => (
            <ListItem key={file.name} dense button>
              <ListItemAvatar><Avatar><InsertDriveFile /></Avatar></ListItemAvatar>
            </ListItem>
          )) : ''}
          */}
        </List>
      </Paper>
      <div style={{ padding: 10 }} />
    </>
  )
}

export default Files
