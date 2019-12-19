import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import { Paper, Typography, CircularProgress, IconButton, Divider } from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
// import Close from '@material-ui/icons/Close'
// import Folder from '@material-ui/icons/Folder'
// import MoreVert from '@material-ui/icons/MoreVert'
// import InsertDriveFile from '@material-ui/icons/InsertDriveFile'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'

import Title from '../../../imports/helpers/title'
import Message from '../../../imports/helpers/message'
import AuthFailure from '../../../imports/errors/authFailure'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import ConnectionFailure from '../../../imports/errors/connectionFailure'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'
import FolderCreationDialog from '../../../imports/dashboard/files/folderCreationDialog'

const Files = () => {
  const [fetching, setFetching] = useState(false)
  const [path, setPath] = useState('/')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<Array<{
    folder: boolean, name: string, lastModified: number, size: number
  }> | null>(null)
  const [folderPromptOpen, setFolderPromptOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const router = useRouter()
  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

  // Used to fetch files.
  const fetchFiles = async () => {
    setFetching(true) // TODO: Make it show up after 1.0 seconds.
    const token = localStorage.getItem('token')
    if (!token) return
    const files = await (await fetch(`${ip}/server/${router.query.server}/files?path=${path}`, {
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
                            setPath(path.substring(0, path.lastIndexOf('/', path.length - 2) + 1))
                          }
                        }}
                      >
                        <ArrowBack />
                      </IconButton>
                    )}
                    <div style={{ padding: 10 }} />
                    <Typography variant='h5'>{path}</Typography>
                    <div style={{ flex: 1 }} />
                    <IconButton onClick={() => setFolderPromptOpen(true)}>
                      <CreateNewFolder />
                    </IconButton>
                    {fetching && (
                      <><div style={{ padding: 10 }} /><CircularProgress color='secondary' /></>
                    )}
                  </div>
                  <Divider />
                  <div style={{ paddingBottom: 10 }} />
                </Paper>
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
                {message && <Message message={message} setMessage={setMessage} />}
              </>
            )
          )}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Files
