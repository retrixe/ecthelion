import { type CssVarsThemeOptions, createTheme, type ThemeOptions } from '@mui/material'
import * as colors from '@mui/material/colors'
import config from './config'

export const black = { main: '#000000', dark: '#000000' }
export const white = { main: '#ffffff', dark: '#ffffff' }

export type Colors = keyof Omit<typeof colors, 'default' | 'common'>
export const defaultColorName = (config.defaultColor ?? 'pink') as Colors
export const defaultColor = defaultColorName in colors ? colors[defaultColorName] : colors.pink

export const defaultThemeOptions: ThemeOptions & CssVarsThemeOptions = {
  palette: { primary: defaultColor, secondary: black },
  colorSchemes: {
    dark: {
      palette: { primary: defaultColor, secondary: white },
    },
  },
  /* components: {
    MuiTextField: { defaultProps: { color: 'primary' } },
    MuiCheckbox: { defaultProps: { color: 'primary' } },
    MuiButton: { defaultProps: { color: 'primary' } },
  }, */
}
const defaultTheme = createTheme(defaultThemeOptions)

export default defaultTheme
