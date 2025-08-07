import React from 'react'
import { LinearProgress, Typography } from '@mui/material'
import dynamic from 'next/dynamic'

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
