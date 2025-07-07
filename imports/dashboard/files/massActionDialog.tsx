import React, { useState } from 'react'
import type { KyInstance } from 'ky/distribution/types/ky'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
} from '@mui/material'

const MassActionDialog = ({
  operation,
  reload,
  files,
  server,
  ky,
  handleClose,
  path,
  setOverlay,
  setMessage,
}: {
  reload: () => void
  operation: 'move' | 'copy' | 'compress'
  setOverlay: (message: string | { text: string; progress: number }) => void
  setMessage: (message: string) => void
  handleClose: () => void
  server: string
  files: string[]
  path: string
  ky: KyInstance
}): React.JSX.Element => {
  const [archiveType, setArchiveType] = useState<'zip' | 'tar' | 'tar.gz' | 'tar.xz' | 'tar.zst'>(
    'zip',
  )
  const [newPath, setNewPath] = useState('')
  const move = operation === 'move' ? 'Move' : operation === 'compress' ? 'Compress' : 'Copy'
  const moved = operation === 'move' ? 'Moved' : operation === 'compress' ? 'Compressed' : 'Copied'
  const moving =
    operation === 'move' ? 'Moving' : operation === 'compress' ? 'Compressing ' : 'Copying'
  const movingl = moving.charAt(0).toLowerCase() + moving.slice(1)

  const handleCompressOperation = (): void => {
    setOverlay(`Compressing ${files.length} files on the server.`)
    const archiveTypeParam = archiveType.startsWith('tar')
      ? '&archiveType=tar&compress=' +
        (archiveType === 'tar.gz'
          ? 'gzip'
          : archiveType === 'tar.xz'
            ? 'xz'
            : archiveType === 'tar.zst'
              ? 'zstd'
              : 'false')
      : ''
    ky.post(
      `server/${server}/compress/v2\
?async=true\
&path=${encodeURIComponent(path + newPath + '.' + archiveType)}${archiveTypeParam}\
&basePath=${encodeURIComponent(path)}`,
      { json: files },
    )
      .then(res => {
        if (res.ok) {
          // Poll the token every second until the compression is finished.
          res
            .json<{ token: string }>()
            .then(async ({ token }) => {
              let finished: boolean | string = false
              while (!finished) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const res = await ky
                  .get(`server/${server}/compress/v2?token=${token}`)
                  .json<{ finished: boolean; error?: string }>()

                finished = res.finished || !!res.error
                if (finished) setMessage(res.error ?? 'Compressed all files successfully!')
              }
              reload()
              setOverlay('')
            })
            .catch(() => setMessage('Failed to compress the files!'))
        } else if (res.status === 404 && archiveType !== 'zip') {
          setOverlay('')
          setMessage('Compressing `tar` archives requires Octyne v1.2 or newer!')
        } else if (res.status === 404) {
          // Fallback to v1 API without async compression and basePath.
          const json = files.map(f => path + f)
          ky.post(`server/${server}/compress?path=${encodeURIComponent(path + newPath + '.zip')}`, {
            json,
          })
            .then(res => {
              setOverlay('')
              if (res.ok) {
                reload()
                setMessage('Compressed all files successfully!')
              } else {
                res
                  .json<{ error: string }>()
                  .then(({ error }) => setMessage(error))
                  .catch(() => setMessage('Failed to compress the files!'))
              }
            })
            .catch(() => {
              setOverlay('')
              setMessage('Failed to compress the files!')
            })
        } else {
          setOverlay('')
          res
            .json<{ error: string }>()
            .then(({ error }) => setMessage(error))
            .catch(() => setMessage('Failed to compress the files!'))
        }
      })
      .catch(() => {
        setOverlay('')
        setMessage('Failed to compress the files!')
      })
  }

  const handleMoveCopyOperation = async (): Promise<void> => {
    setOverlay(`${moving} ${files.length} files.`)
    const operations = files.map(file => ({
      operation: operation === 'move' ? 'mv' : 'cp',
      src: path + file,
      dest: newPath.endsWith('/') ? newPath + file : newPath + '/' + file,
    }))
    try {
      const res = await ky.patch(`server/${server}/files?path=..`, { json: { operations } })
      if (res.ok) {
        reload()
        setMessage(moved + ' all files successfully!')
        setOverlay('')
        return
      } else if (res.status !== 404) {
        const errors = await res.json<{ errors?: { index: number; message: string }[] }>()
        if (errors.errors?.length === 1) {
          setMessage(`Error ${movingl} files: ${errors.errors[0].message}`)
          setOverlay('')
        } else {
          reload()
          setMessage(`Critical error ${movingl} files: Check browser console for info!`)
          setOverlay('')
          console.error(errors.errors)
        }
        return
      }
    } catch (e) {
      reload()
      console.error(e)
      setMessage(`Error ${movingl} files: ${e instanceof Error ? e.message : 'Unknown Error!'}`)
      setOverlay('')
      return
    }

    // Fallback to non-transactional API
    let left = files.length
    setOverlay({ text: `${moving} ${left} out of ${files.length} files.`, progress: 0 })
    const requests = []
    for (const file of files) {
      // setOverlay(file)
      const slash = newPath.endsWith('/') ? '' : '/'
      const body = `${operation === 'move' ? 'mv' : 'cp'}\n${path}${file}\n${newPath}${slash}${file}`
      requests.push(
        ky
          .patch(`server/${server}/file?path=${encodeURIComponent(path + file)}`, { body })
          .then(async r => {
            if (r.status !== 200) {
              setMessage(`Error ${movingl} ${file}\n${(await r.json<{ error: string }>()).error}`)
            }
            const progress = ((files.length - left) * 100) / files.length
            setOverlay({ text: `${moving} ${--left} out of ${files.length} files.`, progress })
            // eslint-disable-next-line promise/always-return -- false positive
            if (localStorage.getItem('ecthelion:logAsyncMassActions'))
              console.log(moved + ' ' + file)
          })
          .catch((e: unknown) =>
            setMessage(`Error ${movingl} ${file}: ${e instanceof Error ? e.message : 'Unknown'}`),
          ),
      )
    }
    Promise.allSettled(requests)
      .then(() => {
        reload()
        setOverlay('')
        setMessage(moved + ' all files successfully!')
      })
      .catch(console.error) // Should not be called, ideally.
  }

  const handleOperation = (): void => {
    handleClose()
    if (operation === 'compress') {
      handleCompressOperation()
    } else {
      handleMoveCopyOperation().catch(console.error) // Should not be called, ideally.
    }
  }
  const prompt =
    operation === 'compress'
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
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleOperation()
              }
            }}
          />
          {operation === 'compress' && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel color='secondary'>Archive Type</InputLabel>
              <Select
                color='secondary'
                value={archiveType}
                label='Archive Type'
                onChange={e => setArchiveType(e.target.value)}
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
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleOperation} color='primary'>
            {move}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MassActionDialog
