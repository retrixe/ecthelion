import React, { useState, useEffect } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import CloudUpload from '@material-ui/icons/CloudUpload'

const UploadButton = ({ uploadFiles, disabled }: { uploadFiles: (files: FileList) => void, disabled: boolean }) => {
  const [files, setFiles] = useState<null | FileList>(null)
  useEffect(() => {
    if (files) {
      uploadFiles(files)
      setFiles(null)
    }
  }, [files, uploadFiles])
  return (
    <>
      <input
        multiple
        style={{ display: 'none' }}
        id='icon-button-file'
        type='file'
        onChange={e => setFiles(e.target.files)}
        onClick={e => { (e.target as HTMLInputElement).value = '' }}
      />
      <Tooltip title='Upload Files'>
        <label htmlFor='icon-button-file'>
          <IconButton aria-label='upload files' disabled={disabled} component='span'>
            <CloudUpload />
          </IconButton>
        </label>
      </Tooltip>
    </>
  )
}

export default UploadButton
