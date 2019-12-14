import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, IconButton, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  CircularProgress, ListItemSecondaryAction, Menu, MenuItem,
  Button, TextField, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Snackbar
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import Folder from '@material-ui/icons/Folder'
import InsertDriveFile from '@material-ui/icons/InsertDriveFile'
import MoreVert from '@material-ui/icons/MoreVert'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'
import Close from '@material-ui/icons/Close'

import { ip } from '../../../config.json'
import fetch from 'isomorphic-unfetch'
import { ConnectionFailure } from '../../imports/connectionFailure'
import Editor from './editor'

// TODO: Consider react-virtualized.

const Message = ({ message, setMessage }: { message: string, setMessage: (a: string) => void }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    open={!!message}
    autoHideDuration={5000}
    onClose={() => setMessage('')}
    ContentProps={{ 'aria-describedby': 'message-id' }}
    message={<span id='message-id'>{message}</span>}
    action={[
      <Button key='undo' color='secondary' size='small' onClick={() => setMessage('')}>
        CLOSE
      </Button>,
      <IconButton key='close' aria-label='close' color='inherit' onClick={() => setMessage('')}>
        <Close />
      </IconButton>
    ]}
  />
)

const Files = (props: { server: string }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState('')
  const [path, setPath] = useState('/')
  const [files, setFiles] = useState<{
    folder: boolean, name: string, lastModified: number, size: number
  }[]>(null)
  const [file, setFile] = useState<{ name: string, content: string } | null>(null)
  const [folderPrompt, setFolderPrompt] = useState<{ open: boolean, name: string } | null>(null)
  const [fetching, setFetching] = useState(false)
  const [message, setMessage] = useState('')

  // componentDidMount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const componentDidMount = async () => {
    setFetching(true) // TODO: Make it show up after 1.0 seconds.
    const files = await (await fetch(`${ip}/server/${props.server}/files?path=${path}`, {
      headers: { Authorization: localStorage.getItem('token') }
    })).json()
    if (files) {
      setFiles(files.contents)
    }
    setFetching(false)
  } // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { componentDidMount() }, [path, menuOpen, props.server])

  // When the dialog for prompting the creation of a folder closes.
  useEffect(() => {
    (async () => {
      if (folderPrompt && folderPrompt.open === false) {
        setFetching(true)
        const createFolder = await (await fetch(
          `${ip}/server/${props.server}/folder?path=/${folderPrompt.name}`, {
            headers: { Authorization: localStorage.getItem('token') }, method: 'POST'
          }
        )).json()
        if (createFolder.success) componentDidMount()
        else {
          setMessage(createFolder.error)
          setFetching(false)
        }
      }
    })() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderPrompt, props.server])

  // Return the code.
  if (!files) return <ConnectionFailure />
  else if (file) {
    return (
      <>
        <Editor
          {...file}
          close={() => setFile(null)}
          server={props.server}
          path={path}
          ip={ip}
          setMessage={setMessage}
        />
        <Message message={message} setMessage={setMessage} />
      </>
    )
  }
  const rtd = (num: number) => Math.round(num * 100) / 100
  const bytesToGb = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < (1024 * 1024)) return rtd(bytes / 1024) + ' KB'
    else if (bytes < (1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024)) + ' MB'
    else if (bytes < (1024 * 1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024 * 1024)) + ' GB'
  }
  const openFile = async (name: string, size: number) => {
    // TODO: Authentication will break this.
    // TODO: Add for MIME-Types.
    if (size < 8 * 1024 * 1024 && (
      name.endsWith('.properties') ||
      name.endsWith('.json') ||
      name.endsWith('.yaml') ||
      name.endsWith('.yml') ||
      name.endsWith('.xml') ||
      name.endsWith('.js') ||
      name.endsWith('.log') ||
      name.endsWith('.sh') ||
      name.endsWith('.txt')
    )) {
      // Fetch the file.
      setFetching(true)
      const req = await fetch(`${ip}/server/${props.server}/file?path=${path}/${name}`, {
        headers: { Authorization: localStorage.getItem('token') }, method: 'GET'
      })
      if (req.status !== 200) {
        setMessage((await req.json()).error)
        return
      }
      const content = await req.text()
      setFile({ name, content })
      setFetching(false)
    } else window.location.href = `${ip}/server/${props.server}/file?path=${path}/${name}`
  }
  return (
    <>
      <Paper style={{ padding: 20 }}>
        <Typography variant='h5' gutterBottom>Files - {props.server}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
          {path === '/' ? '' : <IconButton onClick={() => {
            if (path !== '/') setPath(path.substring(0, path.lastIndexOf('/', path.length - 2) + 1))
          }}>
            <ArrowBack />
          </IconButton>}
          <div style={{ padding: 10 }} />
          <Typography variant='h5'>{path}</Typography>
          <div style={{ padding: 10 }} />
          {fetching ? <CircularProgress color='secondary' /> : ''}
          <div style={{ flex: 1 }} />
          <IconButton onClick={() => setFolderPrompt({ name: '', open: true })}>
            <CreateNewFolder />
          </IconButton>
        </div>
        <Divider />
        <div style={{ paddingBottom: 10 }} />
        {/* List of files and folders. */}
        <List>
          {files.length ? files.sort((a, b) => {
            if (a.folder && !b.folder) return -1
            else if (!a.folder && b.folder) return 1
            else return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1)
          }).map(file => (
            <ListItem key={file.name} dense button onClick={() => {
              file.folder
                ? setPath(path + file.name + '/')
                : openFile(file.name, file.size)
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
                {/* Optimize. */}
                <Menu keepMounted
                  anchorEl={anchorEl}
                  onClose={() => setMenuOpen('')}
                  open={menuOpen === file.name}
                >
                  <MenuItem onClick={async () => {
                    setFetching(true)
                    const a = await (await fetch(`${ip}/server/${props.server}/file?path=${path}/${file.name}`, {
                      headers: { Authorization: localStorage.getItem('token') },
                      method: 'DELETE'
                    })).json()
                    if (a.error) setMessage(a.error)
                    setFetching(false)
                    setMenuOpen('')
                  }}>Delete</MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
          )) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
        </List>
      </Paper>
      {/* Folder creation dialog. */}
      <Dialog open={folderPrompt !== null && folderPrompt.open} onClose={() => setFolderPrompt(null)}>
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter name of the new folder:</DialogContentText>
          <TextField autoFocus margin='dense' label='Folder Name' onChange={
            e => setFolderPrompt({ open: true, name: e.target.value })
          } fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderPrompt(null)} color='secondary'>Cancel</Button>
          <Button onClick={() => setFolderPrompt({ ...folderPrompt, open: false })} color='primary'>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* For messages. */}
      <Message message={message} setMessage={setMessage} />
      <div style={{ padding: 10 }} />
    </>
  )
}

export default Files
