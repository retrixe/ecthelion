import React from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import createCache from '@emotion/cache'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import * as colors from '@mui/material/colors'
import { type ColorSystemOptions, ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import defaultTheme, { defaultThemeOptions } from '../imports/theme'
import localStorageManager from '../imports/helpers/localStorageManager'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: 'css' })

export const UpdateThemeContext = React.createContext(() => {
  /* no-op */
})

export default function MyApp(
  props: AppProps & { emotionCache?: EmotionCache },
): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Customisable theming options.
  const [currentTheme, setCurrentTheme] = React.useState(defaultTheme)
  const updateTheme = (): void => {
    if (typeof localStorage !== 'object') return
    const themeColor = localStorage.getItem('ecthelion:theme-color') as
      | keyof Omit<typeof colors, 'common'>
      | null
    const squareCorners = localStorage.getItem('ecthelion:square-corners') === 'true'

    // If no square corners and no color theme...
    if (!squareCorners && !themeColor) return setCurrentTheme(defaultTheme)
    const newThemeOptions = { ...defaultThemeOptions }

    // Set square corners.
    newThemeOptions.components ??= {}
    if (squareCorners) newThemeOptions.components.MuiPaper = { defaultProps: { square: true } }

    // Set color theme.
    if (themeColor && themeColor in colors) {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      newThemeOptions.palette!.primary = colors[themeColor]
      ;(newThemeOptions.colorSchemes!.dark as ColorSystemOptions).palette!.primary =
        colors[themeColor]
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

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
      <ThemeProvider theme={currentTheme} defaultMode='system' storageManager={localStorageManager}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <UpdateThemeContext.Provider value={updateTheme}>
          <Component {...pageProps} />
        </UpdateThemeContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  )
}
