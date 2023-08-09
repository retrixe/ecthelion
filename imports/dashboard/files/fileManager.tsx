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
import FileList, { type File } from './fileList'
import MassActionDialog from './massActionDialog'
import ModifyFileDialog from './modifyFileDialog'
import FolderCreationDialog from './folderCreationDialog'

let euc: (uriComponent: string | number | boolean) => string
try { euc = encodeURIComponent } catch (e) { euc = e => e.toString() }
const editorExts = ['properties', 'json', 'yaml', 'yml', 'xml', 'js', 'log', 'sh', 'txt']

const FileManager = (props: {
  setServerExists: React.Dispatch<React.SetStateAction<boolean>>
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element => {
  const router = useRouter()
  const { server, node, ip } = useOctyneData() // nodeExists is handled above.
  const ky = useKy(node)

  const filename = router.query.file?.toString()
  const queryPath = router.query.path
  const path = normalisePath((Array.isArray(queryPath) ? queryPath.join('/') : queryPath) ?? '/')

  const [menuOpen, setMenuOpen] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [search, setSearch] = useState<string | null>(null)
  const [searchApplies, setSearchApplies] = useState(true)

  const [overlay, setOverlay] = useState('')
  const [message, setMessage] = useState('')
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<null | 'folderNotExist' | 'pathNotFolder' | 'outsideServerDir'>(null)

  const [files, setFiles] = useState<File[] | null>(null)
  const [filesSelected, setFilesSelected] = useState<string[]>([])
  const [file, setFile] = useState<{ name: string, content: string } | null>(null)

  const [download, setDownload] = useState('')
  const [folderPromptOpen, setFolderPromptOpen] = useState(false)
  const [massActionMenuOpen, setMassActionMenuOpen] = useState<HTMLButtonElement | null>(null)
  const [modifyFileDialogOpen, setModifyFileDialogOpen] = useState<'' | 'move' | 'copy' | 'rename'>('')
  const [massActionDialogOpen, setMassActionDialogOpen] = useState<'move' | 'copy' | 'compress' | false>(false)

  const searchRef = useRef<HTMLInputElement>()

  // Update path when URL changes. Requires normalised path.
  const updatePath = useCallback((newPath: string, file?: string, replace?: boolean) => {
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
    delete route.query.file
    delete as.query.server
    delete as.query.path
    delete as.query.file
    if (file) {
      route.query.file = file
      as.query.file = file
    }
    (replace ? router.replace : router.push)(route, as, { shallow: true })
      // Apply search only when search has been focused once or if you are just downloading files.
      .then(() => setSearchApplies(file !== router.query.file))
      .catch(console.error)
  }, [router, server])

  // Used to fetch files.
  const { setAuthenticated, setServerExists } = props
  const fetchFiles = useCallback(() => {
    ;(async () => {
      setFetching(true) // TODO: Make it show up after 1.0 seconds.
      setError(null)
      const files: any = await ky.get(`server/${server}/files?path=${euc(path)}`).json()
      if (files.error === 'This server does not exist!') setServerExists(false)
      else if (files.error === 'You are not authenticated to access this resource!') setAuthenticated(false)
      else if (files.error === 'The folder requested is outside the server!') setError('outsideServerDir')
      else if (files.error === 'This folder does not exist!') setError('folderNotExist')
      else if (files.error === 'This is not a folder!') {
        return updatePath(parentPath(path), path.substring(0, path.length - 1).split('/').pop(), true)
      } else if (files) {
        setFiles(files.contents)
        setFilesSelected([])
      }
      setFetching(false)
    })().catch(e => { console.error(e); setMessage(`Failed to fetch files: ${e.message}`); setFetching(false) })
  }, [path, ky, server, updatePath, setAuthenticated, setServerExists])

  const prevPath = useRef(path)
  useEffect(() => { // Fetch files.
    if (server && (path !== prevPath.current || files === null)) {
      fetchFiles()
    }
    prevPath.current = path
  }, [fetchFiles, path, files, server])

  useEffect(() => {
    if (typeof window === 'undefined' || file) return
    const eventListener = (e: KeyboardEvent): void => {
      if (e.code === 'F3' || (e.ctrlKey && e.code === 'KeyF')) {
        e.preventDefault()
        if (searchRef.current !== document.activeElement) searchRef.current?.focus()
        else searchRef.current?.setSelectionRange(0, searchRef.current.value.length)
        setSearch(search => typeof search === 'string' ? search : '')
      } else if (e.code === 'Escape') {
        e.preventDefault()
        setSearch(null)
      }
    }
    window.addEventListener('keydown', eventListener)
    return () => window.removeEventListener('keydown', eventListener)
  }, [file])

  const loadFileInEditor = useCallback(async (filename: string) => {
    setFetching(true)
    const req = await ky.get(`server/${server}/file?path=${euc(joinPath(path, filename))}`)
    if (req.status !== 200) {
      setMessage((await req.json<{ error: string }>()).error)
      setFetching(false)
      updatePath(path) // Remove file from path.
      return
    }
    const content = await req.text()
    setFile({ name: filename, content })
    setFetching(false)
  }, [ky, path, server, updatePath])

  // Load any file in path.
  useEffect(() => {
    // We don't setFile(null) in case New File interferes, we set it in file close instead.
    // Changing the path in the URL will reload the page, so fresh state anyways like that.
    if (!filename) return
    // We need info about the current files, else we can't load the file.
    // This won't overwrite the editor because `files` never changes outside actions.
    // When an editor is open, no actions can be performed, so this is not a problem.
    if (!files) return
    // Check if the file exists, and depending on its metadata, act accordingly.
    const file = files.find(file => file.name === filename)
    if (!file) {
      updatePath(path) // Remove file from path.
      return setMessage('The requested file does not exist!')
    } else if (
      file.size < 2 * 1024 * 1024 &&
      (editorExts.includes(filename.split('.').pop() ?? '') || file.mimeType.startsWith('text/'))
    ) {
      loadFileInEditor(filename).catch(err => {
        console.error(err)
        setMessage('An error occurred while loading file!')
      })
    } else setDownload(filename)
  }, [filename, files, path, updatePath, loadFileInEditor])

  // Multiple file logic requests.
  const handleCreateFolder = async (name: string): Promise<void> => {
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
  const handleModifyFile = async (newPath: string, action: 'move' | 'copy' | 'rename'): Promise<void> => {
    setModifyFileDialogOpen('')
    setMenuOpen('')
    setAnchorEl(null)
    setFetching(true)
    if (action === 'rename' && newPath.includes('/')) {
      setMessage('Renamed file cannot have / in it!')
      setFetching(false)
      return
    }
    const target = action === 'rename' ? path + newPath : newPath
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
  const handleFilesDelete = (): void => {
    setMassActionMenuOpen(null)
    let total = filesSelected.length
    setOverlay(`Deleting ${total} out of ${filesSelected.length} files.`)
    const ops = []
    for (let i = 0; i < filesSelected.length; i++) {
      const file = filesSelected[i]
      // setOverlay('Deleting ' + file)
      // Save the file.
      ops.push(ky.delete(`server/${server}/file?path=${euc(path + file)}`).then(async r => {
        if (r.status !== 200) {
          setMessage(`Error deleting ${file}\n${(await r.json<{ error: string }>()).error}`)
        } else setOverlay(`Deleting ${--total} out of ${filesSelected.length} files.`)
        if (localStorage.getItem('logAsyncMassActions')) console.log('Deleted ' + file)
      }).catch(e => setMessage(`Error deleting ${file}\n${e}`)))
    }
    Promise.allSettled(ops).then(() => {
      setMessage('Deleted all files successfully!')
      setOverlay('')
      fetchFiles()
    }).catch(console.error) // Should not be called, ideally.
  }
  const handleFilesUpload = (files: FileList): void => {
    if (overlay) return // TODO: Allow multiple file uploads/mass actions simultaneously in future.
    ;(async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setOverlay(`Uploading ${file.name} to ${path}`)
        // Save the file.
        const formData = new FormData()
        formData.append('upload', file, file.name)
        const r = await ky.post(`server/${server}/file?path=${euc(path)}`, { body: formData, timeout: false })
        if (r.status !== 200) {
          setMessage(`Error uploading ${file.name}\n${(await r.json<{ error: string }>()).error}`)
        }
        setOverlay('')
      }
      setMessage('Uploaded all files successfully!')
      if (path === prevPath.current) fetchFiles() // prevPath is current path after useEffect call.
    })().catch(e => { console.error(e); setMessage(`Failed to upload files: ${e.message}`) })
  }
  // Single file logic.
  const handleDeleteMenuButton = (): void => {
    ;(async () => {
      setMenuOpen('')
      setFetching(true)
      const a = await ky.delete(`server/${server}/file?path=${euc(path + menuOpen)}`)
        .json<{ error: string }>()
      if (a.error) setMessage(a.error)
      setFetching(false)
      setMenuOpen('')
      fetchFiles()
    })().catch(e => { console.error(e); setMessage(`Failed to delete file: ${e.message}`) })
  }
  const handleDownloadMenuButton = (): void => {
    ;(async () => {
      setMenuOpen('')
      const ticket = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
      window.location.href = `${ip}/server/${server}/file?ticket=${ticket}&path=${path}${menuOpen}`
    })().catch(e => { console.error(e); setMessage(`Failed to download file: ${e.message}`) })
  }
  const handleDecompressMenuButton = (): void => {
    ;(async () => {
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
    })().catch(e => { console.error(e); setMessage(`Failed to decompress file: ${e.message}`) })
  }
  const handleCloseDownload = (): void => { setDownload(''); updatePath(path) }
  const handleDownloadButton = (): void => {
    ;(async () => {
      handleCloseDownload()
      // document.cookie = `X-Authentication=${localStorage.getItem('ecthelion:token')}`
      const ticket = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
      const loc = `${ip}/server/${server}/file?ticket=${ticket}&path=${euc(joinPath(path, download))}`
      window.location.href = loc
    })().catch((e: any) => { console.error(e); setMessage(`Failed to download file: ${e.message}`) })
  }
  const handleSaveFile = async (name: string, content: string): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('upload', new Blob([content]), name)
      const encodedPath = encodeURIComponent(path)
      const r = await ky.post(`server/${server}/file?path=${encodedPath}`, { body: formData })
      if (r.status !== 200) setMessage((await r.json<{ error: string }>()).error)
      else setMessage('Saved successfully!')
    } catch (e: any) { setMessage(`Error saving file! ${e}`); console.error(e) }
  }

  const selectedFile = menuOpen && files?.find(e => e.name === menuOpen)
  const titleName = file?.name ? file.name + ' - ' : (path ? path + ' - ' : '')
  const alternativeDisplay = !error ? (
    !files || !server ? <ConnectionFailure loading={fetching} /> : null
  ) : (
    <Paper style={{ padding: 10, marginBottom: '2em' }}>
      <Typography>{error === 'folderNotExist'
        ? `The folder you are trying to access (${path}) does not exist.`
        : error === 'outsideServerDir'
          ? `The path you are trying to access (${path}) is outside the server folder!`
          : `The path you are trying to access (${path}) is a file!`}
      </Typography>
      {path !== '/' && (
        <Typography
          style={{ textDecoration: 'underline', cursor: fetching ? 'wait' : 'pointer' }}
          onClick={() => (
            !fetching &&
            updatePath(error === 'outsideServerDir' ? '/' : parentPath(path), undefined, true)
          )}
        >
          {error === 'outsideServerDir' ? 'Go to root folder?' : 'Try going up one path?'}
        </Typography>
      )}
    </Paper>
  )
  return (
    <>
      <Title
        title={`${titleName}Files${server ? ' - ' + server : ''} - Ecthelion`}
        description='The files of a process running on Octyne.'
        url={`/dashboard/${server}/files`}
      />
      {!files || alternativeDisplay ? alternativeDisplay : (
        file !== null ? (
          <Paper style={{ padding: 20 }}>
            <Editor
              {...file}
              siblingFiles={files.map(e => e.name)}
              onSave={handleSaveFile}
              onClose={() => { setFile(null); updatePath(path); fetchFiles() }}
              onDownload={() => {
                ;(async () => {
                  const ott = encodeURIComponent((await ky.get('ott').json<{ ticket: string }>()).ticket)
                  window.location.href = `${ip}/server/${server}/file?path=${path}${file.name}&ticket=${ott}`
                })().catch(e => { console.error(e); setMessage(`Failed to download file: ${e.message}`) })
              }}
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
                else updatePath(path, file.name)
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
          onClose={handleCloseDownload}
          message={`Do you want to download '${download}'?`}
          action={[
            <Button key='download' size='small' color='primary' onClick={handleDownloadButton}>
              Download
            </Button>,
            <Button key='close' size='small' aria-label='close' color='inherit' onClick={handleCloseDownload}>
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
          <MenuItem onClick={() => setMassActionDialogOpen('move')} disabled={!!overlay}>Move</MenuItem>
          <MenuItem onClick={() => setMassActionDialogOpen('copy')} disabled={!!overlay}>Copy</MenuItem>
          <MenuItem onClick={() => handleFilesDelete()} disabled={!!overlay}>Delete</MenuItem>
          <MenuItem onClick={() => setMassActionDialogOpen('compress')} disabled={!!overlay}>Compress</MenuItem>
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
