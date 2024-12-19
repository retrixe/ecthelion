import React from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import createCache from '@emotion/cache'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import defaultTheme, { defaultThemeOptions, white, black } from '../imports/theme'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: 'css' })

export const UpdateThemeContext = React.createContext(() => {})

export default function MyApp (props: AppProps & { emotionCache?: EmotionCache }): React.JSX.Element {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Customisable theming options.
  const [currentTheme, setCurrentTheme] = React.useState(defaultTheme)
  const updateTheme = (): void => {
    if (typeof localStorage !== 'object') return
    const squareCorners = localStorage.getItem('ecthelion:square-corners') === 'true'
    const lightMode = localStorage.getItem('ecthelion:light-mode') === 'true'

    // If no square corners and no light theme...
    if (!squareCorners && !lightMode) return setCurrentTheme(defaultTheme)
    const newThemeOptions = { ...defaultThemeOptions }

    // Set square corners.
    newThemeOptions.components ??= {}
    if (squareCorners) newThemeOptions.components.MuiPaper = { defaultProps: { square: true } }
    else if (newThemeOptions.components.MuiPaper) delete newThemeOptions.components.MuiPaper
    // Set light theme.
    if (lightMode) newThemeOptions.palette = { primary: white, secondary: black, mode: 'light' }
    setCurrentTheme(createTheme(newThemeOptions))
  }
  React.useEffect(updateTheme, [])

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
      <ThemeProvider theme={currentTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <UpdateThemeContext.Provider value={updateTheme}>
          <Component {...pageProps} />
        </UpdateThemeContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  )
}
