import { createMuiTheme, colors } from '@material-ui/core'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: colors.blue,
    secondary: colors.purple,
    type: 'dark'
  }
})

export default theme
