import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'

import {
  Paper, Typography, CircularProgress, IconButton, Divider, Tooltip, Menu, MenuItem, Slide,
  Snackbar, Button, TextField
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Replay from '@mui/icons-material/Replay'
import Search from '@mui/icons-material/Search'
// import Close from '@mui/icons-material/Close'
import MoreVert from '@mui/icons-material/MoreVert'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CreateNewFolder from '@mui/icons-material/CreateNewFolder'

import Title from '../../helpers/title'
import Message from '../../helpers/message'
import ConnectionFailure from '../../errors/connectionFailure'
import useOctyneData from '../useOctyneData'
import useKy from '../../helpers/useKy'

import Editor from './editor'
import Overlay from './overlay'
import { joinPath, normalisePath, parentPath } from './fileUtils'
import UploadButton from './uploadButton'
import FileList, { File } from './fileList'
import MassActionDialog from './massActionDialog'
import ModifyFileDialog from './modifyFileDialog'
import FolderCreationDialog from './folderCreationDialog'

let euc: (uriComponent: string | number | boolean) => string
try { euc = encodeURIComponent } catch (e) { euc = e => e.toString() }

const FileManager = (props: {
  setServerExists: React.Dispatch<React.SetStateAction<boolean>>
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const { server, node, ip } = useOctyneData() // nodeExists is handled above.
  const ky = useKy(node)

  const queryPath = router.query.path
  const path = normalisePath((Array.isArray(queryPath) ? queryPath.join('/') : queryPath) || '/')

  const [menuOpen, setMenuOpen] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [search, setSearch] = useState<string | null>(null)
  const [searchApplies, setSearchApplies] = useState(true)

  const [overlay, setOverlay] = useState('')
  const [message, setMessage] = useState('')
  const [fetching, setFetching] = useState(true)

  const [files, setFiles] = useState<File[] | null>(null)
  const [filesSelected, setFilesSelected] = useState<string[]>([])
  const [file, setFile] = useState<{ name: string, content: string } | null>(null)

  const [download, setDownload] = useState('')
  const [folderPromptOpen, setFolderPromptOpen] = useState(false)
  const [massActionMenuOpen, setMassActionMenuOpen] = useState<HTMLButtonElement | null>(null)
  const [modifyFileDialogOpen, setModifyFileDialogOpen] = useState<'' | 'move' | 'copy' | 'rename'>('')
  const [massActionDialogOpen, setMassActionDialogOpen] = useState<'move' | 'copy' | 'compress' | false>(false)

  const searchRef = useRef<HTMLInputElement>()

  // Used to fetch files.
  const { setAuthenticated, setServerExists } = props
  const fetchFiles = useCallback(async () => {
    setFetching(true) // TODO: Make it show up after 1.0 seconds.
    let files: any = {}
    try {
      files = await ky.get(`server/${server}/files?path=${euc(path)}`).json()
    } catch (e: any) {
      setMessage(e.message)
    }
    if (files.error === 'This server does not exist!') setServerExists(false)
    else if (files.error === 'You are not authenticated to access this resource!') setAuthenticated(false)
    else if (files) {
      setFiles(files.contents)
      setFilesSelected([])
    }
    setFetching(false)
  }, [path, ky, server, setAuthenticated, setServerExists])

  useEffect(() => { // Fetch files.
    if (server) fetchFiles()
  }, [fetchFiles, server])

  useEffect(() => {
    if (typeof window === 'undefined' || file) return
    const eventListener = (e: KeyboardEvent) => {
      if (e.code === 'F3' || (e.ctrlKey && e.code === 'KeyF')) {
        e.preventDefault()
        searchRef.current?.focus()
        setSearch(search => typeof search === 'string' ? search : '')
      } else if (e.code === 'Escape') {
        e.preventDefault()
        setSearch(null)
      }
    }
    window.addEventListener('keydown', eventListener)
    return () => window.removeEventListener('keydown', eventListener)
  }, [file])

  // Update path when URL changes. Requires normalised path.
  const updatePath = (newPath: string) => {
    const route = {
      pathname: '/dashboard/[server]/files/[[...path]]',
      query: { ...router.query }
    }
    const as = {
      pathname: `/dashboard/${server}/files${newPath}`,
      query: { ...router.query }
    }
    delete route.query.server
    delete route.query.path
    delete as.query.server
    delete as.query.path
    router.push(route, as, { shallow: true }).then(() => setSearchApplies(false))
  }

  const extensions = ['properties', 'json', 'yaml', 'yml', 'xml', 'js', 'log', 'sh', 'txt']
  const openFile = async (name: string, size: number, mimeType: string) => {
    if (
      size < 2 * 1024 * 1024 &&
      (extensions.includes(name.split('.').pop() || '') || mimeType.startsWith('text/'))
    ) {
      // Fetch the file.
      setFetching(true)
      const req = await ky.get(`server/${server}/file?path=${euc(joinPath(path, name))}`)
      if (req.status !== 200) {
        setMessage((await req.json<{ error: string }>()).error)
        setFetching(false)
        return
      }
      const content = await req.text()
      setFile({ name, content })
      setFetching(false)
    } else setDownload(`${ip}/server/${server}/file?path=${euc(joinPath(path, name))}`)
  }

  // Multiple file logic requests.
  const handleCreateFolder = async (name: string) => {
    setFolderPromptOpen(false)
    setFetching(true)
    try {
      const endpoint = `server/${server}/folder?path=/${euc(joinPath(path, name))}`
      const createFolder = await ky.post(endpoint).json<{ success: boolean, error: string }>()
      if (createFolder.success) fetchFiles()
      else setMessage(createFolder.error)
      setFetching(false)
    } catch (e: any) {
      setMessage(e.message)
      setFetching(false)
    }
  }
  const handleModifyFile = async (pathToMove: string, action: 'move' | 'copy' | 'rename') => {
    setModifyFileDialogOpen('')
    setMenuOpen('')
    setAnchorEl(null)
    setFetching(true)
    if (action === 'rename' && pathToMove.includes('/')) {
      setMessage('Renamed file cannot have / in it!')
      setFetching(false)
      return
    }
    const target = action === 'rename' ? path + pathToMove : pathToMove
    try {
      const editFile = await ky.patch(`server/${server}/file`, {
        body: `${action === 'copy' ? 'cp' : 'mv'}\n${path}${menuOpen}\n${target}`
      }).json<{ success: boolean, error: string }>()
      if (editFile.success) fetchFiles()
      else setMessage(editFile.error)
      setFetching(false)
    } catch (e: any) {
      setMessage(e.message)
      setFetching(false)
    }
  }
  const handleFilesDelete = async () => {
    setMassActionMenuOpen(null)
    let total = filesSelected.length
    setOverlay(`Deleting ${total} out of ${filesSelected.length} files.`)
    const ops = []
    for (let i = 0; i < filesSelected.length; i++) {
      const file = filesSelected[i]
      // setOverlay('Deleting ' + file)
      // Save the file.
      ops.push(await ky.delete(`server/${server}/file?path=${euc(path + file)}`).then(async r => {
        if (r.status !== 200) {
          setMessage(`Error deleting ${file}\n${(await r.json<{ error: string }>()).error}`)
        } else setOverlay(`Deleting ${--total} out of ${filesSelected.length} files.`)
        if (localStorage.getItem('logAsyncMassActions')) console.log('Deleted ' + file)
      }))
    }
    Promise.allSettled(ops).then(() => {
      setMessage('Deleted all files successfully!')
      setOverlay('')
      fetchFiles()
    })
  }
  const handleFilesUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setOverlay(file.name)
      // Save the file.
      const formData = new FormData()
      formData.append('upload', file, file.name)
      const r = await ky.post(`server/${server}/file?path=${euc(path)}`, { body: formData })
      if (r.status !== 200) {
        setMessage(`Error uploading ${file.name}\n${(await r.json<{ error: string }>()).error}`)
      }
      setOverlay('')
    }
    setMessage('Uploaded all files successfully!')
    fetchFiles()
  }
  // Single file logic.
  const handleDeleteMenuButton = async () => {
    setMenuOpen('')
    setFetching(true)
    const a = await ky.delete(`server/${server}/file?path=${euc(path + menuOpen)}`)
      .json<{ error: string }>()
    if (a.error) setMessage(a.error)
    setFetching(false)
    setMenuOpen('')
    fetchFiles()
  }
  const handleDownloadMenuButton = async () => {
    setMenuOpen('')
    const ticket = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
    window.location.href = `${ip}/server/${server}/file?ticket=${ticket}&path=${path}${menuOpen}`
  }
  const handleDecompressMenuButton = async () => {
    setMenuOpen('')
    setFetching(true)
    const a = await ky.post(`server/${server}/decompress?path=${euc(path + menuOpen)}`, {
      body: path + menuOpen.split('.').slice(0, -1).join('.')
    })
      .json<{ error: string }>()
    if (a.error) setMessage(a.error)
    setFetching(false)
    setMenuOpen('')
    fetchFiles()
  }
  const handleDownloadButton = async () => {
    setDownload('')
    // document.cookie = `X-Authentication=${localStorage.getItem('token')}`
    const ticket = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
    window.location.href = download.replace('?path', `?ticket=${ticket}&path`)
  }

  const selectedFile = menuOpen && files && files.find(e => e.name === menuOpen)
  const titleName = file?.name ? file.name + ' - ' : (path ? path + ' - ' : '')
  return (
    <>
      <Title
        title={`${titleName}Files${server ? ' - ' + server : ''} - Ecthelion`}
        description='The files of a process running on Octyne.'
        url={`/dashboard/${server}/files`}
      />
      {!files || !server ? <ConnectionFailure loading={fetching} /> : (
        file !== null ? (
          <Paper style={{ padding: 20 }}>
            <Editor
              {...file}
              siblingFiles={files.map(e => e.name)}
              handleClose={() => { setFile(null); fetchFiles() }}
              server={server}
              path={path}
              ky={ky}
              ip={ip}
              setMessage={setMessage}
            />
          </Paper>
        ) : (
          <Paper
            style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}
            onDragOver={e => {
              e.stopPropagation()
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }} onDrop={e => {
              e.stopPropagation()
              e.preventDefault()
              handleFilesUpload(e.dataTransfer.files)
            }}
          >
            <Typography variant='h5' gutterBottom>Files - {server}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', padding: 5, flexWrap: 'wrap' }}>
              {path !== '/' && (
                <IconButton disabled={fetching} onClick={() => updatePath(parentPath(path))}>
                  <ArrowBack />
                </IconButton>
              )}
              <div style={{ padding: 10 }} />
              <Typography variant='h5'>{path}</Typography>
              <div style={{ flex: 1 }} />
              {filesSelected.length > 0 && (
                <>
                  <Tooltip title='Mass Actions'>
                    <span>
                      <IconButton disabled={fetching} onClick={e => setMassActionMenuOpen(e.currentTarget)}>
                        <MoreVert />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <div style={{ paddingRight: 5 }} />
                </>
              )}
              <Tooltip title='Reload'>
                <span>
                  <IconButton disabled={fetching} onClick={fetchFiles}>
                    <Replay />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title='Search'>
                <span>
                  <IconButton onClick={() => setSearch(s => typeof s === 'string' ? null : '')}>
                    <Search />
                  </IconButton>
                </span>
              </Tooltip>
              <div style={{ paddingRight: 5 }} />
              <Tooltip title='Create Folder'>
                <span>
                  <IconButton disabled={fetching} onClick={() => setFolderPromptOpen(true)}>
                    <CreateNewFolder />
                  </IconButton>
                </span>
              </Tooltip>
              <div style={{ paddingRight: 5 }} />
              <Tooltip title='Create File'>
                <span>
                  <IconButton disabled={fetching} onClick={() => setFile({ name: '', content: '' })}>
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
            <div style={{ paddingBottom: 10 }} />
            {typeof search === 'string' && (
              <TextField
                autoFocus
                fullWidth
                size='small'
                label='Search for files...'
                value={search}
                inputRef={searchRef}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchApplies(true)}
              />
            )}
            {search === null && <Divider />}
            <div style={{ paddingBottom: 10 }} />
            {/* List of files and folders. */}
            <FileList
              path={path}
              files={files.filter(e => (
                typeof search === 'string'
                  ? e.name.toLowerCase().includes(search.toLowerCase()) || !searchApplies
                  : true
              ))}
              disabled={fetching}
              filesSelected={filesSelected}
              setFilesSelected={setFilesSelected}
              onClick={(file) => {
                if (file.folder) updatePath(joinPath(path, file.name))
                else openFile(file.name, file.size, file.mimeType)
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
          message={`Do you want to download '${download.replace(/%2F/g, '/').split('/').filter(e => e).pop()}'?`}
          action={[
            <Button key='download' size='small' color='primary' onClick={handleDownloadButton}>
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
          handleCreateFolder={async (name: string) => await handleCreateFolder(name)}
        />
      )}
      {modifyFileDialogOpen && (
        <ModifyFileDialog
          filename={menuOpen}
          operation={modifyFileDialogOpen}
          handleClose={() => setModifyFileDialogOpen('')}
          handleEdit={async (path) => await handleModifyFile(path, modifyFileDialogOpen)}
        />
      )}
      {massActionDialogOpen && (
        <MassActionDialog
          ky={ky}
          path={path}
          files={filesSelected}
          reload={fetchFiles}
          setOverlay={setOverlay}
          setMessage={setMessage}
          operation={massActionDialogOpen}
          handleClose={() => {
            setMassActionMenuOpen(null)
            setMassActionDialogOpen(false)
          }}
          endpoint={`server/${server}/${massActionDialogOpen === 'compress' ? 'compress' : 'file'}`}
        />
      )}
      {massActionMenuOpen && (
        <Menu open keepMounted anchorEl={massActionMenuOpen} onClose={() => setMassActionMenuOpen(null)}>
          <MenuItem onClick={() => setMassActionDialogOpen('move')}>Move</MenuItem>
          <MenuItem onClick={() => setMassActionDialogOpen('copy')}>Copy</MenuItem>
          <MenuItem onClick={async () => await handleFilesDelete()}>Delete</MenuItem>
          <MenuItem onClick={() => setMassActionDialogOpen('compress')}>Compress</MenuItem>
        </Menu>
      )}
      {selectedFile && (
        <Menu open keepMounted anchorEl={anchorEl} onClose={() => setMenuOpen('')}>
          <MenuItem onClick={() => setModifyFileDialogOpen('rename')}>Rename</MenuItem>
          <MenuItem onClick={() => setModifyFileDialogOpen('move')}>Move</MenuItem>
          <MenuItem onClick={() => setModifyFileDialogOpen('copy')}>Copy</MenuItem>
          <MenuItem onClick={handleDeleteMenuButton}>Delete</MenuItem>
          {!selectedFile.folder && <MenuItem onClick={handleDownloadMenuButton}>Download</MenuItem>}
          {!selectedFile.folder && selectedFile.name.endsWith('.zip') && (
            <MenuItem onClick={handleDecompressMenuButton}>Decompress</MenuItem>
          )}
        </Menu>
      )}
      {message && <Message message={message} setMessage={setMessage} />}
      {overlay && <Overlay message={overlay} />}
    </>
  )
}

export default FileManager
