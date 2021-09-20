import { createTheme } from '@mui/material'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createTheme({
  palette: {
    primary: { main: '#000000', dark: '#000000' }, // colors.blue
    secondary: { main: '#ffffff', dark: '#ffffff' }, // colors.purple
    mode: 'dark'
  },
  components: {
    MuiTextField: { defaultProps: { color: 'secondary' } },
    MuiCheckbox: { defaultProps: { color: 'secondary' } },
    MuiButton: { defaultProps: { color: 'secondary' } }
  }
})

export default theme
