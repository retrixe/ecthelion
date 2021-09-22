import { createTheme } from '@mui/material'

// A theme with custom primary and secondary color.
// It's optional.
// TODO: Run these updates in _app.tsx and not here.
const squareCorners = typeof localStorage === 'object' && localStorage.getItem('square-corners') === 'true'
const lightMode = typeof localStorage === 'object' && localStorage.getItem('light-mode') === 'true'
const black = { main: '#000000', dark: '#000000' }
const white = { main: '#ffffff', dark: '#ffffff' }
const theme = createTheme({
  palette: {
    primary: lightMode ? white : black, // colors.blue
    secondary: lightMode ? black : white, // colors.purple
    mode: lightMode ? 'light' : 'dark'
  },
  components: {
    MuiTextField: { defaultProps: { color: 'secondary' } },
    MuiCheckbox: { defaultProps: { color: 'secondary' } },
    MuiButton: { defaultProps: { color: 'secondary' } },
    MuiPaper: { defaultProps: { square: squareCorners } }
  }
})

export default theme
