import { createTheme, ThemeOptions } from '@mui/material'

// A theme with custom primary and secondary color.
// It's optional.
export const black = { main: '#000000', dark: '#000000' } // colors.blue
export const white = { main: '#ffffff', dark: '#ffffff' } // colors.purple
export const defaultThemeOptions: ThemeOptions = {
  palette: {
    primary: black,
    secondary: white,
    mode: 'dark'
  },
  components: {
    MuiTextField: { defaultProps: { color: 'secondary' } },
    MuiCheckbox: { defaultProps: { color: 'secondary' } },
    MuiButton: { defaultProps: { color: 'secondary' } }
  }
}
const theme = createTheme(defaultThemeOptions)

export default theme
