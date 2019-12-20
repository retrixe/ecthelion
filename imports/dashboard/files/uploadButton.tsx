import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { IconButton, Tooltip } from '@material-ui/core'
import CloudUpload from '@material-ui/icons/CloudUpload'

const UploadButton = ({ setMessage, path, serverIp, setOverlay }: {
  setMessage: (message: string) => void,
  setOverlay: (message: string) => void,
  path: string,
  serverIp: string
}) => {
  const [files, setFiles] = useState<null | FileList>(null)
  const router = useRouter()
  useEffect(() => {
    // TODO: Wait for stable endpoint on server.
    if (files) {
      (async () => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setOverlay(file.name)
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
          setOverlay('')
        }
        setMessage('Uploaded all files successfully!')
      })()
    }
  }, [files, router.query.server, serverIp, path, setMessage, setOverlay])
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
          <IconButton aria-label='upload files' component='span'>
            <CloudUpload />
          </IconButton>
        </label>
      </Tooltip>
    </>
  )
}

export default UploadButton
