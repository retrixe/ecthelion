import React, { useState } from 'react'
import { type KyInstance } from 'ky/distribution/types/ky'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField,
  Select, InputLabel, FormControl, MenuItem
} from '@mui/material'

const MassActionDialog = ({
  operation, reload, files, server, ky, handleClose, path, setOverlay, setMessage
}: {
  reload: () => void
  operation: 'move' | 'copy' | 'compress'
  setOverlay: (message: string | { text: string, progress: number }) => void
  setMessage: (message: string) => void
  handleClose: () => void
  server: string
  files: string[]
  path: string
  ky: KyInstance
}): JSX.Element => {
  const [archiveType, setArchiveType] = useState<'zip' | 'tar' | 'tar.gz' | 'tar.xz' | 'tar.zst'>('zip')
  const [newPath, setNewPath] = useState('')
  const move = operation === 'move' ? 'Move' : operation === 'compress' ? 'Compress' : 'Copy'
  const moved = operation === 'move' ? 'Moved' : operation === 'compress' ? 'Compressed' : 'Copied'
  const moving = operation === 'move' ? 'Moving' : operation === 'compress' ? 'Compressing ' : 'Copying'
  const movingl = operation === 'move' ? 'moving' : operation === 'compress' ? 'compressing ' : 'copying'

  const handleCompressOperation = (): void => {
    setOverlay(`Compressing ${files.length} files on the server.`)
    const archiveTypeParam = archiveType.startsWith('tar') ? '&archiveType=tar&compress=' + (
      archiveType === 'tar.gz' ? 'gzip'
        : archiveType === 'tar.xz' ? 'xz'
          : archiveType === 'tar.zst' ? 'zstd'
            : 'false'
    ) : ''
    ky.post(`server/${server}/compress/v2\
?async=true\
&path=${encodeURIComponent(path + newPath + '.' + archiveType)}${archiveTypeParam}\
&basePath=${encodeURIComponent(path)}`, { json: files }).then(res => {
      if (res.ok) {
        // Poll the token every second until the compression is finished.
        res.json<{ token: string }>().then(async ({ token }) => {
          while (true) {
            const res = await ky.get(`server/${server}/compress/v2?token=${token}`)
              .json<{ finished: boolean, error: string }>()
            if (res.finished || res.error) {
              reload()
              setOverlay('')
              setMessage(res.error ?? 'Compressed all files successfully!')
              break
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }).catch(() => setMessage('Failed to compress the files!'))
      } else if (res.status === 404 && archiveType !== 'zip') {
        setOverlay('')
        setMessage('Compressing `tar` archives requires Octyne v1.2 or newer!')
      } else if (res.status === 404) {
        // Fallback to v1 API without async compression and basePath.
        const json = files.map(f => path + f)
        ky.post(`server/${server}/compress?path=${encodeURIComponent(path + newPath + '.zip')}`, { json })
          .then(res => {
            setOverlay('')
            if (res.ok) {
              reload()
              setMessage('Compressed all files successfully!')
            } else {
              res.json<{ error: string }>()
                .then(({ error }) => setMessage(error ?? 'Failed to compress the files!'))
                .catch(() => setMessage('Failed to compress the files!'))
            }
          }).catch(() => { setOverlay(''); setMessage('Failed to compress the files!') })
      } else {
        setOverlay('')
        res.json<{ error: string }>()
          .then(({ error }) => setMessage(error ?? 'Failed to compress the files!'))
          .catch(() => setMessage('Failed to compress the files!'))
      }
    }).catch(() => { setOverlay(''); setMessage('Failed to compress the files!') })
  }

  const handleMoveCopyOperation = (): void => {
    let left = files.length
    setOverlay({ text: `${moving} ${left} out of ${files.length} files.`, progress: 0 })
    const requests = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // setOverlay(file)
      const slash = newPath.endsWith('/') ? '' : '/'
      const body = `${operation === 'move' ? 'mv' : 'cp'}\n${path}${file}\n${newPath}${slash}${file}`
      requests.push(ky.patch(`server/${server}/file?path=${encodeURIComponent(path + file)}`, { body })
        .then(async r => {
          if (r.status !== 200) {
            setMessage(`Error ${movingl} ${file}\n${(await r.json<{ error: string }>()).error}`)
          }
          const progress = (files.length - left) * 100 / files.length
          setOverlay({ text: `${moving} ${--left} out of ${files.length} files.`, progress })
          if (localStorage.getItem('ecthelion:logAsyncMassActions')) console.log(moved + ' ' + file)
        })
        .catch(e => setMessage(`Error ${movingl} ${file}\n${e}`)))
    }
    Promise.allSettled(requests).then(() => {
      reload()
      setOverlay('')
      setMessage(moved + ' all files successfully!')
    }).catch(console.error) // Should not be called, ideally.
  }

  const handleOperation = (): void => {
    handleClose()
    if (operation === 'compress') {
      handleCompressOperation()
    } else {
      handleMoveCopyOperation()
    }
  }
  const prompt = operation === 'compress'
    ? 'Enter path to archive to create:'
    : `Enter path of folder to ${operation} to:`
  return (
    <>
      {/* Folder creation dialog. */}
      <Dialog open onClose={handleClose}>
        <DialogTitle>{move} Files</DialogTitle>
        <DialogContent>
          <DialogContentText>{prompt}</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='normal'
            label='New Path'
            value={newPath}
            onChange={e => setNewPath(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleOperation() } }}
          />
          {operation === 'compress' && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel color='secondary'>Archive Type</InputLabel>
              <Select
                color='secondary'
                value={archiveType}
                label='Archive Type'
                onChange={e => setArchiveType(e.target.value as typeof archiveType)}
              >
                <MenuItem value='zip'>zip</MenuItem>
                <MenuItem value='tar'>tar</MenuItem>
                <MenuItem value='tar.gz'>tar.gz</MenuItem>
                <MenuItem value='tar.xz'>tar.xz</MenuItem>
                <MenuItem value='tar.zst'>tar.zst</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleOperation} color='primary'>{move}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MassActionDialog
