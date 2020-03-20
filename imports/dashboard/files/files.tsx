import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ip, nodes } from '../../../config.json'

import {
  Paper, Typography, CircularProgress, IconButton, Divider, Tooltip, Menu, MenuItem, Slide, Snackbar,
  Button, useMediaQuery, useTheme
} from '@material-ui/core'
// import Close from '@material-ui/icons/Close'
import Add from '@material-ui/icons/Add'
import Replay from '@material-ui/icons/Replay'
import MoreVert from '@material-ui/icons/MoreVert'
import ArrowBack from '@material-ui/icons/ArrowBack'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'

import Message from '../../helpers/message'
import ConnectionFailure from '../../errors/connectionFailure'

import Editor from './editor'
import Overlay from './overlay'
import UploadButton from './uploadButton'
import FileList, { File } from './fileList'
import MassActionDialog from './massActionDialog'
import FolderCreationDialog from './folderCreationDialog'

/*
const joinPath = (a: string, b: string) => {
  if (a.endsWith('/')) return a + b + '/'
  else return a + '/' + b + '/'
}
*/

const request = async (ip: string, endpoint: string, opts?: RequestInit): Promise<Response> => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token in localStorage!')
  }
  const res = await fetch(`${ip}${endpoint}`, {
    ...opts, headers: { ...(opts && opts.headers ? opts.headers : {}), Authorization: token }
  })
  return res
}

const Files = (props: { path: string }) => {
  const router = useRouter()
  const xs = useMediaQuery(useTheme().breakpoints.only('xs'))

  const [path, setPath] = useState(props.path)

  const [menuOpen, setMenuOpen] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const [overlay, setOverlay] = useState('')
  const [message, setMessage] = useState('')
  const [fetching, setFetching] = useState(false)

  const [files, setFiles] = useState<File[] | null>(null)
  const [filesSelected, setFilesSelected] = useState<string[]>([])
  const [file, setFile] = useState<{ name: string, content: string } | null>(null)

  const [download, setDownload] = useState('')
  const [folderPromptOpen, setFolderPromptOpen] = useState(false)
  const [massActionMenuOpen, setMassActionMenuOpen] = useState<HTMLButtonElement | null>(null)
  const [massActionDialogOpen, setMassActionDialogOpen] = useState<'move' | 'copy' | false>(false)
  const opip = !!(fetching)

  const serverIp = typeof router.query.node === 'string'
    ? (nodes as { [index: string]: string })[router.query.node]
    : ip

  // Used to fetch files.
  const fetchFiles = async () => {
    setFetching(true) // TODO: Make it show up after 1.0 seconds.
    let files: any
    try {
      files = await (await request(serverIp, `/server/${router.query.server}/files?path=${path}`)).json()
    } catch (e) {
      setMessage(e.message)
    }
    if (files) {
      setFiles(files.contents)
      setFilesSelected([])
    }
    setFetching(false)
  }

  // Check if the user is authenticated.
  useEffect(() => {
    (async () => {
      if (!router.query.server) return
      setFetching(true) // TODO: Make it show up after 1.0 seconds.
      let files: any
      try {
        files = await (await request(serverIp, `/server/${router.query.server}/files?path=${path}`)).json()
      } catch (e) {
        setMessage(e.message)
      }
      if (files) {
        setFiles(files.contents)
        setFilesSelected([])
      }
      setFetching(false)
    })()
  }, [path, router.query.server, serverIp])

  // Update path when URL changes.
  const updatePath = (newPath: string) => {
    const route = {
      pathname: '/dashboard/[server]/files',
      query: { ...router.query, path: newPath, server: undefined }
    }
    const as = {
      pathname: `/dashboard/${router.query.server}/files`,
      query: { ...router.query, path: newPath, server: undefined }
    }
    delete route.query.server
    delete as.query.server
    router.push(route, as, { shallow: true })
  }

  const extensions = ['properties', 'json', 'yaml', 'yml', 'xml', 'js', 'log', 'sh', 'txt']
  const openFile = async (name: string, size: number, mimeType: string) => {
    if (
      size < 2 * 1024 * 1024 &&
      (extensions.includes(name.split('.').pop() || '') || mimeType.startsWith('text/'))
    ) {
      // Fetch the file.
      setFetching(true)
      const req = await request(serverIp, `/server/${router.query.server}/file?path=${path}/${name}`)
      if (req.status !== 200) {
        setMessage((await req.json()).error)
        setFetching(false)
        return
      }
      const content = await req.text()
      setFile({ name, content })
      setFetching(false)
    } else setDownload(`${serverIp}/server/${router.query.server}/file?path=${path}${name}`)
  }

  // Multiple file logic requests.
  const handleCreateFolder = async (name: string) => {
    setFolderPromptOpen(false)
    setFetching(true)
    try {
      const createFolder = await request(
        serverIp, `/server/${router.query.server}/folder?path=/${path}${name}`, { method: 'POST' }
      ).then(async e => e.json())
      if (createFolder.success) fetchFiles()
      else setMessage(createFolder.error)
      setFetching(false)
    } catch (e) {
      setMessage(e.message)
      setFetching(false)
    }
  }
  const handleFilesDelete = async () => {
    setMassActionMenuOpen(null)
    for (let i = 0; i < filesSelected.length; i++) {
      const file = filesSelected[i]
      setOverlay('Deleting ' + file)
      // Save the file.
      const r = await request(serverIp, `/server/${router.query.server}/file?path=${path}${file}`, { method: 'DELETE' })
      if (r.status !== 200) setMessage(`Error deleting ${file}\n${(await r.json()).error}`)
      setOverlay('')
    }
    setMessage('Deleted all files successfully!')
    fetchFiles()
  }
  const handleFilesUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setOverlay(file.name)
      // Save the file.
      const formData = new FormData()
      formData.append('upload', file, file.name)
      const r = await request(serverIp, `/server/${router.query.server}/file?path=${path}`, {
        method: 'POST',
        body: formData
      })
      if (r.status !== 200) setMessage(`Error uploading ${file.name}\n${(await r.json()).error}`)
      setOverlay('')
    }
    setMessage('Uploaded all files successfully!')
    fetchFiles()
  }
  return (
    <>
      {!files ? <ConnectionFailure /> : (
        file !== null ? (
          <Paper style={{ padding: 20 }}>
            <Editor
              {...file}
              siblingFiles={files.map(e => e.name)}
              handleClose={() => setFile(null)}
              server={`${router.query.server}`}
              path={path}
              ip={serverIp}
              setMessage={setMessage}
            />
          </Paper>
        ) : (
          <Paper style={{ padding: 20 }}>
            <Typography variant='h5' gutterBottom>Files - {router.query.server}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', padding: 5, flexWrap: 'wrap' }}>
              {path !== '/' && (
                <IconButton
                  disabled={opip}
                  onClick={() => {
                    if (path !== '/') {
                      const newPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1)
                      setPath(newPath)
                      updatePath(newPath)
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
              )}
              <div style={{ padding: 10 }} />
              <Typography variant='h5'>{path}</Typography>
              <div style={{ flex: 1 }} />
              {filesSelected.length > 0 && (
                <>
                  <Tooltip title='Mass Actions'>
                    <IconButton disabled={opip} onClick={e => setMassActionMenuOpen(e.currentTarget)}>
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                  <div style={{ paddingRight: 5 }} />
                </>
              )}
              <Tooltip title='Reload'>
                <span>
                  <IconButton disabled={opip} onClick={fetchFiles}>
                    <Replay />
                  </IconButton>
                </span>
              </Tooltip>
              <div style={{ paddingRight: 5 }} />
              <Tooltip title='Create Folder'>
                <span>
                  <IconButton disabled={opip} onClick={() => setFolderPromptOpen(true)}>
                    <CreateNewFolder />
                  </IconButton>
                </span>
              </Tooltip>
              <div style={{ paddingRight: 5 }} />
              <Tooltip title='Create File'>
                <span>
                  <IconButton disabled={opip} onClick={() => setFile({ name: '', content: '' })}>
                    <Add />
                  </IconButton>
                </span>
              </Tooltip>
              <div style={{ paddingRight: 5 }} />
              <UploadButton
                disabled={!!overlay}
                uploadFiles={handleFilesUpload}
              />
              {fetching && (
                <><div style={{ paddingRight: 5 }} /><CircularProgress color='secondary' /></>
              )}
            </div>
            <Divider />
            <div style={{ paddingBottom: 10 }} />
            {/* List of files and folders. */}
            <FileList
              path={path}
              opip={opip}
              files={files}
              filesSelected={filesSelected}
              setFilesSelected={setFilesSelected}
              onClick={(file) => {
                if (file.folder) {
                  setPath(`${path}${file.name}/`)
                  updatePath(`${path}${file.name}/`)
                } else openFile(file.name, file.size, file.mimeType)
              }}
              openMenu={(fn, anchor) => {
                setMenuOpen(fn)
                setAnchorEl(anchor)
              }}
            />
          </Paper>
        )
      )}
      {download && (
        <Snackbar
          open
          autoHideDuration={10000}
          TransitionComponent={(props) => <Slide direction='up' {...props} />}
          onClose={() => setDownload('')}
          message={`Do you want to download '${download.split('/')[download.split('/').length - 1]}'?`}
          action={[
            <Button
              key='download'
              size='small'
              color='secondary'
              onClick={() => {
                setDownload('')
                window.location.href = download
              }}
            >
              Download
            </Button>,
            <Button key='close' size='small' aria-label='close' color='inherit' onClick={() => setDownload('')}>
              Close
            </Button>
          ]}
        />
      )}
      {folderPromptOpen && (
        <FolderCreationDialog
          handleClose={() => setFolderPromptOpen(false)}
          handleCreateFolder={async (name: string) => handleCreateFolder(name)}
        />
      )}
      {massActionDialogOpen && (
        <MassActionDialog
          path={path}
          files={filesSelected}
          setOverlay={setOverlay}
          setMessage={setMessage}
          operation={massActionDialogOpen}
          handleClose={() => setMassActionDialogOpen(false)}
          endpoint={`${serverIp}/server/${router.query.server}/file`}
        />
      )}
      {massActionMenuOpen && (
        <Menu
          keepMounted
          anchorEl={massActionMenuOpen}
          onClose={() => setMassActionMenuOpen(null)}
          open
        >
          <MenuItem onClick={() => setMassActionDialogOpen('move')}>Move</MenuItem>
          <MenuItem onClick={() => setMassActionDialogOpen('copy')}>Copy</MenuItem>
          <MenuItem onClick={async () => handleFilesDelete()}>Delete</MenuItem>
        </Menu>
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
              setMenuOpen('')
              setFetching(true)
              const a = await request(
                serverIp,
                `/server/${router.query.server}/file?path=${path}${menuOpen}`,
                { method: 'DELETE' }
              ).then(async e => e.json())
              if (a.error) setMessage(a.error)
              setFetching(false)
              setMenuOpen('')
              fetchFiles()
            }}
          >
            Delete
          </MenuItem>
          {!(() => {
            const file = files && files.find(e => e.name === menuOpen)
            return file && file.folder
          })() && (
            <MenuItem
              onClick={() => {
                setMenuOpen('')
                window.location.href = `${serverIp}/server/${router.query.server}/file?path=${path}${menuOpen}`
              }}
            >
              Download
            </MenuItem>
          )}
        </Menu>
      )}
      {message && <Message message={message} setMessage={setMessage} />}
      {overlay && <Overlay message={overlay} xs={xs} />}
    </>
  )
}

export default Files
