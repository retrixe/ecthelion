import { LinearProgress, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import React from 'react'

const DynamicEditor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <>
      <Typography gutterBottom>Loading editor...</Typography>
      <LinearProgress />
    </>
  ),
})

export default DynamicEditor
