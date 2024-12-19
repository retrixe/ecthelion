import React, { useState, useEffect } from 'react'
import { Typography, Paper, Divider, Switch, FormGroup, FormControlLabel } from '@mui/material'

import config from '../../imports/config'
import Title from '../../imports/helpers/title'
import useKy from '../../imports/helpers/useKy'
import SettingsLayout from '../../imports/settings/settingsLayout'
import { UpdateThemeContext } from '../_app'
import packageJson from '../../package.json'

const { version } = packageJson

const About = (): React.JSX.Element => {
  const ky = useKy()
  const [loggedIn, setLoggedIn] = useState(true)
  const [lightMode, setLightMode] = useState(false)
  const [terminalUi, setTerminalUi] = useState(false)
  const [squareCorners, setSquareCorners] = useState(false)
  const updateTheme = React.useContext(UpdateThemeContext)

  useEffect(() => {
    if (typeof localStorage !== 'object') return
    ky.get('servers', { throwHttpErrors: true }).catch(() => setLoggedIn(false))
    setLightMode(localStorage.getItem('ecthelion:light-mode') === 'true')
    setTerminalUi(localStorage.getItem('ecthelion:terminal-ui') === 'true')
    setSquareCorners(localStorage.getItem('ecthelion:square-corners') === 'true')
  }, [ky])
  const handleSquareCornersToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSquareCorners(e.target.checked)
    if (e.target.checked) localStorage.setItem('ecthelion:square-corners', 'true')
    else localStorage.removeItem('ecthelion:square-corners')
    updateTheme()
  }
  const handleTerminalUiToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTerminalUi(e.target.checked)
    if (e.target.checked) localStorage.setItem('ecthelion:terminal-ui', 'true')
    else localStorage.removeItem('ecthelion:terminal-ui')
    updateTheme()
  }
  const handleLightModeToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLightMode(e.target.checked)
    if (e.target.checked) localStorage.setItem('ecthelion:light-mode', 'true')
    else localStorage.removeItem('ecthelion:light-mode')
    updateTheme()
  }

  const [octyneVersion, setOctyneVersion] = useState('')
  useEffect(() => {
    ky('').json<{ version: string }>()
      .then(({ version }) => setOctyneVersion(version))
      .catch(e => console.error('Failed to retrieve Octyne version for main node! Perhaps Octyne is outdated or not running?', e))
  })
  const nodeLength = Object.keys(config.nodes ?? {}).length

  return (
    <React.StrictMode>
      <Title
        title='About - Ecthelion'
        description='About this running instance of Ecthelion.'
        url='/settings/about'
        index
      />
      <SettingsLayout loggedIn={loggedIn}>
        <Paper style={{ padding: 20 }}>
          <Typography gutterBottom variant='h5'>About Ecthelion</Typography>
          <Divider style={{ marginBottom: '0.70em' }} />
          <Typography gutterBottom>
            This instance is running Ecthelion {version}
            {octyneVersion ? ` and Octyne ${octyneVersion}` : ' (Octyne version unknown)'}
            {octyneVersion && nodeLength ? ' (on primary node)' : ''}.
          </Typography>
          <div style={{ marginBottom: '0.35em' }} />
          <Typography variant='h6'>Some quick tips:</Typography>
          <Typography component='ul' style={{ paddingInlineStart: 20 }}>
            <li>You can drag and drop files from your system onto the file explorer&apos;s file list!</li>
            <li>You can Ctrl+Click files to select them, and Shift+Click to select multiple files at once!</li>
            <li>You can upload multiple files at once!</li>
            <li>Text files can be created and opened inside Ecthelion!
              Don&apos;t worry, you can still download them from the file menu or the editor.
            </li>
            {/* <li>The stop button updates after 10 seconds and console is limited to 650 lines.</li> */}
          </Typography>
        </Paper>
        <Paper style={{ padding: 20, marginTop: 16 }}>
          <Typography gutterBottom variant='h5'>UI Settings</Typography>
          <Divider style={{ marginBottom: '0.70em' }} />
          <FormGroup>
            <FormControlLabel
              label='Terminal Coloured Console'
              control={<Switch color='info' checked={terminalUi} onChange={handleTerminalUiToggle} />}
            />
            <FormControlLabel
              label='Light Mode (Here be dragons)'
              control={<Switch color='info' checked={lightMode} onChange={handleLightModeToggle} />}
            />
            <FormControlLabel
              label='Square Corners'
              control={<Switch color='info' checked={squareCorners} onChange={handleSquareCornersToggle} />}
            />
          </FormGroup>
        </Paper>
      </SettingsLayout>
    </React.StrictMode>
  )
}

export default About
