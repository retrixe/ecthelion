import { createTheme, type CssVarsThemeOptions, type ThemeOptions } from '@mui/material'
import * as colors from '@mui/material/colors'

export const black = { main: '#000000', dark: '#000000' }
export const white = { main: '#ffffff', dark: '#ffffff' }

export const defaultThemeOptions: ThemeOptions & CssVarsThemeOptions = {
  palette: { primary: colors.pink, secondary: black },
  colorSchemes: {
    dark: {
      palette: { primary: colors.pink, secondary: white },
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
