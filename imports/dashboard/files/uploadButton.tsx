import CloudUpload from '@mui/icons-material/CloudUpload'
import { IconButton, Tooltip } from '@mui/material'
import React from 'react'

const UploadButton = ({
  uploadFiles,
  disabled,
}: {
  uploadFiles: (files: FileList) => void
  disabled: boolean
}): React.JSX.Element => {
  return (
    <>
      <input
        multiple
        style={{ display: 'none' }}
        id='icon-button-file'
        type='file'
        onChange={e => {
          if (e.target.files) uploadFiles(e.target.files)
        }}
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
