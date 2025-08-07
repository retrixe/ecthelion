import { createTheme, type ThemeOptions } from '@mui/material'

// A theme with custom primary and secondary color.
// It's optional.
export const black = { main: '#000000', dark: '#000000' } // colors.blue
export const white = { main: '#ffffff', dark: '#ffffff' } // colors.purple
export const defaultThemeOptions: ThemeOptions = {
  palette: {
    primary: white,
    secondary: black,
    mode: 'dark',
  },
  /* components: {
    MuiTextField: { defaultProps: { color: 'primary' } },
    MuiCheckbox: { defaultProps: { color: 'primary' } },
    MuiButton: { defaultProps: { color: 'primary' } },
  }, */
}
const theme = createTheme(defaultThemeOptions)

export default theme
