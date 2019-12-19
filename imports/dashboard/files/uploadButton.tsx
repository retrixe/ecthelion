import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { IconButton, Tooltip, LinearProgress, Typography, Paper } from '@material-ui/core'
import CloudUpload from '@material-ui/icons/CloudUpload'

const UploadButton = ({ setMessage, path, serverIp }: {
  setMessage: (message: string) => void,
  path: string,
  serverIp: string
}) => {
  const [files, setFiles] = useState<null | FileList>(null)
  const [fileName, setFileName] = useState('')
  const router = useRouter()
  useEffect(() => {
    // TODO: Wait for stable endpoint on server.
    if (files) {
      (async () => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setFileName(file.name)
          // Save the file.
          const formData = new FormData()
          formData.append('upload', file, file.name)
          const token = localStorage.getItem('token')
          if (!token) return
          const r = await fetch(
            `${serverIp}/server/${router.query.server}/file?path=${path}`,
            { method: 'POST', body: formData, headers: { Authorization: token } }
          )
          if (r.status !== 200) setMessage(`Error uploading ${file.name}\n${(await r.json()).error}`)
          setFileName('')
        }
        setMessage('Uploaded all files successfully!')
      })()
    }
  }, [files, router.query.server, serverIp, path, setMessage])
  return (
    <>
      <input
        multiple
        style={{ display: 'none' }}
        id='icon-button-file'
        type='file'
        onChange={e => setFiles(e.target.files)}
      />
      <Tooltip title='Upload Files'>
        <label htmlFor='icon-button-file'>
          <IconButton color='primary' aria-label='upload files' component='span'>
            <CloudUpload />
          </IconButton>
        </label>
      </Tooltip>
      {fileName && (
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
          <Paper style={{ padding: 20, height: 80, margin: 20 }}>
            <LinearProgress />
            <br />
            <Typography variant='body1'>Uploading {fileName}...</Typography>
          </Paper>
        </div>
      )}
    </>
  )
}

export default UploadButton
