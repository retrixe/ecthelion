import React from 'react'
import { LinearProgress, Paper, Typography } from '@mui/material'
import dynamic from 'next/dynamic'

const DynamicEditor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <Paper style={{ padding: 20 }}>
      <Typography gutterBottom>Loading editor...</Typography>
      <LinearProgress color='secondary' />
    </Paper>
  ),
})

export default DynamicEditor
