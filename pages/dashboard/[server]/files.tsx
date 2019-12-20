import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import {
  Paper, Typography, CircularProgress, IconButton, Divider, Tooltip, LinearProgress,
  Menu, MenuItem, useMediaQuery, useTheme
} from '@material-ui/core'
// import Close from '@material-ui/icons/Close'
import ArrowBack from '@material-ui/icons/ArrowBack'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'

import Title from '../../../imports/helpers/title'
import Message from '../../../imports/helpers/message'

import AuthFailure from '../../../imports/errors/authFailure'
import ConnectionFailure from '../../../imports/errors/connectionFailure'

import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'

// import FileList from '../../../imports/dashboard/files/fileList'
import UploadButton from '../../../imports/dashboard/files/uploadButton'
import FolderCreationDialog from '../../../imports/dashboard/files/folderCreationDialog'

const Files = () => {
  const router = useRouter()
  const xs = useMediaQuery(useTheme().breakpoints.only('xs'))

  const [menuOpen, setMenuOpen] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [fetching, setFetching] = useState(false)
  const [path, setPath] = useState('/')
  const [overlay, setOverlay] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<Array<{
    folder: boolean, name: string, lastModified: number, size: number
  }> | null>(null)
  const [folderPromptOpen, setFolderPromptOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(true)

  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

  // Used to fetch files.
  const fetchFiles = async () => {
    setFetching(true) // TODO: Make it show up after 1.0 seconds.
    const token = localStorage.getItem('token')
    if (!token) return
    const files = await (await fetch(`${serverIp}/server/${router.query.server}/files?path=${path}`, {
      headers: { Authorization: token }
    })).json()
    if (files) {
      setFiles(files.contents)
    }
    setFetching(false)
  }

  // Check if the user is authenticated.
  useEffect(() => { authWrapperCheck().then(e => setAuthenticated(e || false)) }, [])
  const onMount = useCallback(fetchFiles, [])
  useEffect(() => { onMount() }, [onMount])

  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Files - Ecthelion'
        description='The files of a process running on Octyne.'
        url={`/dashboard/${router.query.server}/files`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!authenticated ? <AuthFailure /> : (
            !files ? <ConnectionFailure /> : (
              <>
                <Paper style={{ padding: 20 }}>
                  <Typography variant='h5' gutterBottom>Files - {router.query.server}</Typography>
                  <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
                    {path !== '/' && (
                      <IconButton
                        onClick={() => {
                          if (path !== '/') {
                            const newPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1)
                            setPath(newPath)
                            const asPath = router.asPath.replace('path=' + path, 'path=' + newPath)
                            router.push(
                              asPath.replace(router.query.server.toString(), '[server]'),
                              asPath,
                              { shallow: true }
                            )
                          }
                        }}
                      >
                        <ArrowBack />
                      </IconButton>
                    )}
                    <div style={{ padding: 10 }} />
                    <Typography variant='h5'>{path}</Typography>
                    <div style={{ flex: 1 }} />
                    <Tooltip title='Create Folder'>
                      <IconButton onClick={() => setFolderPromptOpen(true)}>
                        <CreateNewFolder />
                      </IconButton>
                    </Tooltip>
                    <div style={{ padding: 10 }} />
                    <UploadButton
                      setMessage={setMessage}
                      setOverlay={setOverlay}
                      serverIp={serverIp}
                      path={path}
                    />
                    {fetching && (
                      <><div style={{ padding: 10 }} /><CircularProgress color='secondary' /></>
                    )}
                  </div>
                  <Divider />
                  <div style={{ paddingBottom: 10 }} />
                  {/* List of files and folders. */}
                  {/* <FileList path={path} files={files} openFile={() => {}} setPath={() => {}} /> */}
                </Paper>
              </>
            )
          )}
        </div>
        {folderPromptOpen && (
          <FolderCreationDialog
            handleClose={() => setFolderPromptOpen(false)}
            reload={fetchFiles}
            setFetching={setFetching}
            setMessage={setMessage}
            ip={serverIp}
            server={`${router.query.server}`}
          />
        )}
        {menuOpen && (
          <Menu
            keepMounted
            anchorEl={anchorEl}
            onClose={() => setMenuOpen('')}
            open
          >
            <MenuItem
              onClick={async () => {
                setFetching(true)
                const token = localStorage.getItem('token')
                if (!token) return
                const a = await (await fetch(
                  `${serverIp}/server/${router.query.server}/file?path=${path}/${menuOpen}`,
                  { headers: { Authorization: token }, method: 'DELETE' }
                )).json()
                if (a.error) setMessage(a.error)
                setFetching(false)
                setMenuOpen('')
                fetchFiles()
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        )}
        {message && <Message message={message} setMessage={setMessage} />}
        {overlay && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed', /* Sit on top of the page content */
              width: '100%', /* Full width (cover the whole page) */
              height: '100%', /* Full height (cover the whole page) */
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000
            }}
          >
            <div style={{ flex: 1 }} />
            <Paper style={{ padding: 20, height: 80, margin: 20, marginLeft: xs ? 20 : 220 }}>
              <LinearProgress />
              <br />
              <Typography variant='body1'>{overlay}</Typography>
            </Paper>
          </div>
        )}
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Files
