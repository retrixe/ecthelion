import CloudUpload from '@mui/icons-material/CloudUpload'
import { IconButton, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'

const UploadButton = ({
  uploadFiles,
  disabled,
}: {
  uploadFiles: (files: FileList) => void
  disabled: boolean
}): React.JSX.Element => {
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
        onClick={e => {
          ;(e.target as HTMLInputElement).value = ''
        }}
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
