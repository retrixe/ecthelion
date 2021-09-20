import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import createCache from '@emotion/cache'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../imports/theme'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: 'css' })

export default function MyApp (props: AppProps & { emotionCache?: EmotionCache }) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        {/* Use minimum-scale=1 to enable GPU rasterization */}
        <meta
          name='viewport'
          content='user-scalable=0, initial-scale=1,
          minimum-scale=1, width=device-width, height=device-height'
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {/* TODO: https://github.com/mui-org/material-ui/issues/28477 */}
        <style jsx global>
          {'body {font-size: 0.875rem !important; line-height: 1.43 !important}'}
        </style>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
