import { createMuiTheme } from '@material-ui/core'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: { main: '#000' }, // colors.blue
    secondary: { main: '#fff' }, // colors.purple
    type: 'dark'
  },
  props: { MuiTextField: { color: 'secondary' } }
})

export default theme
