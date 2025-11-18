import {
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Typography,
  useColorScheme,
} from '@mui/material'
import * as colors from '@mui/material/colors'
import React, { useEffect, useState } from 'react'

import config from '../../imports/config'
import Title from '../../imports/helpers/title'
import useKy from '../../imports/helpers/useKy'
import SettingsLayout from '../../imports/settings/settingsLayout'
import { type Colors, defaultColorName } from '../../imports/theme'
import packageJson from '../../package.json'
import { UpdateThemeContext } from '../_app'

const { version } = packageJson

const tastefulImages = [
  '737487.png.avif',
  '1349198.png.avif',
  '1351258.png.avif',
  '60095408_p0.jpg.avif',
  '63064155_p0.jpg.avif',
  '77414471_p0.jpg.avif',
  '77734327_p0.jpg.avif',
  '85153440_p0.jpg.avif',
  '89024838_p0.jpg.avif',
  '95394439_p0.jpg.avif',
]

const colorNameToReadableName = (colorName: Colors): string =>
  colorName.charAt(0).toUpperCase() + colorName.slice(1).replace(/([A-Z])/g, ' $1')

const About = (): React.JSX.Element => {
  const ky = useKy()
  const { mode, setMode } = useColorScheme()
  const [loggedIn, setLoggedIn] = useState(true)
  const [terminalUi, setTerminalUi] = useState(false)
  const [themeColor, setThemeColor] = useState<Colors | 'default'>('default')
  const [animeTheme, setAnimeTheme] = useState<string | null>(null)
  const [squareCorners, setSquareCorners] = useState(false)
  const updateTheme = React.useContext(UpdateThemeContext)

  useEffect(() => {
    if (typeof localStorage !== 'object') return
    ky.get('servers', { throwHttpErrors: true }).catch(() => setLoggedIn(false))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- yeah it's fetching data in sync
    setThemeColor((localStorage.getItem('ecthelion:theme-color') as Colors | null) ?? 'default')
    setTerminalUi(localStorage.getItem('ecthelion:terminal-ui') === 'true')
    setAnimeTheme(localStorage.getItem('ecthelion:anime-theme'))
    setSquareCorners(localStorage.getItem('ecthelion:square-corners') === 'true')
  }, [ky])
  const handleThemeColorChange = (value: Colors | 'default'): void => {
    setThemeColor(value)
    if (value === 'default') localStorage.removeItem('ecthelion:theme-color')
    else localStorage.setItem('ecthelion:theme-color', value)
    updateTheme()
  }
  const handleTerminalUiToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTerminalUi(e.target.checked)
    if (e.target.checked) localStorage.setItem('ecthelion:terminal-ui', 'true')
    else localStorage.removeItem('ecthelion:terminal-ui')
    updateTheme()
  }
  const handleAnimeThemeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImage = e.target.checked
      ? tastefulImages[kawaiiiii.current++ % tastefulImages.length]
      : null
    setAnimeTheme(newImage)
    if (newImage) localStorage.setItem('ecthelion:anime-theme', newImage)
    else localStorage.removeItem('ecthelion:anime-theme')
    updateTheme()
  }
  const handleSquareCornersToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSquareCorners(e.target.checked)
    if (e.target.checked) localStorage.setItem('ecthelion:square-corners', 'true')
    else localStorage.removeItem('ecthelion:square-corners')
    updateTheme()
  }

  const [octyneVersion, setOctyneVersion] = useState('')
  useEffect(() => {
    ky('')
      .json<{ version: string }>()
      .then(({ version }) => setOctyneVersion(version))
      .catch((e: unknown) =>
        console.error(
          'Failed to retrieve Octyne version for main node! Perhaps Octyne is outdated or not running?',
          e,
        ),
      )
  })
  const nodeLength = Object.keys(config.nodes ?? {}).length

  const kawaiiiii = React.useRef(0)
  const currentImage = tastefulImages.findIndex(img => img === animeTheme) + 1

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
          <Typography gutterBottom variant='h5'>
            About Ecthelion
          </Typography>
          <Divider style={{ marginBottom: '0.70em' }} />
          <Typography gutterBottom>
            This instance is running Ecthelion {version}
            {octyneVersion ? ` and Octyne ${octyneVersion}` : ' (Octyne version unknown)'}
            {octyneVersion && nodeLength ? ' (on primary node)' : ''}.
          </Typography>
          <div style={{ marginBottom: '0.35em' }} />
          <Typography variant='h6'>Some quick tips:</Typography>
          <Typography component='ul' style={{ paddingInlineStart: 20 }}>
            <li>
              You can drag and drop files from your system onto the file explorer&apos;s file list!
            </li>
            <li>
              You can Ctrl+Click files to select them, and Shift+Click to select multiple files at
              once!
            </li>
            <li>You can upload multiple files at once!</li>
            <li>
              Text files can be created and opened inside Ecthelion! Don&apos;t worry, you can still
              download them from the file menu or the editor.
            </li>
            {/* <li>The stop button updates after 10 seconds and console is limited to 650 lines.</li> */}
          </Typography>
        </Paper>
        <Paper style={{ padding: 20, marginTop: 16 }}>
          <Typography gutterBottom variant='h5'>
            UI Settings
          </Typography>
          <Divider style={{ marginBottom: '0.70em' }} />
          <FormControl>
            <FormLabel id='theme-toggle-label'>Theme</FormLabel>
            <RadioGroup
              aria-labelledby='theme-toggle-label'
              name='theme-toggle'
              row
              value={mode ?? 'system'}
              onChange={e => setMode(e.target.value as 'light' | 'dark' | 'system')}
            >
              <FormControlLabel value='system' control={<Radio />} label='System' />
              <FormControlLabel value='light' control={<Radio />} label='Light' />
              <FormControlLabel value='dark' control={<Radio />} label='Dark' />
            </RadioGroup>
          </FormControl>
          <br />
          <FormControl sx={{ m: '1rem 0', width: '16rem' }}>
            <InputLabel id='theme-color-select'>Color</InputLabel>
            <Select
              size='small'
              labelId='theme-color-select'
              value={themeColor}
              label='Color'
              onChange={e => handleThemeColorChange(e.target.value)}
            >
              <MenuItem value='default'>
                Default ({colorNameToReadableName(defaultColorName)})
              </MenuItem>
              {Object.entries(colors)
                .filter(([key]) => key !== 'common')
                .map(([key]) => (
                  <MenuItem key={key} value={key}>
                    {colorNameToReadableName(key as Colors)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormGroup>
            <FormControlLabel
              label='Terminal Coloured Console'
              control={<Switch checked={terminalUi} onChange={handleTerminalUiToggle} />}
            />
            <FormControlLabel
              label='Square Corners (Unsupported)'
              control={<Switch checked={squareCorners} onChange={handleSquareCornersToggle} />}
            />
            <FormControlLabel
              label={`anime theme! uwu kawaiiiii~${animeTheme ? ` (image #${currentImage})` : ''}`}
              control={<Switch checked={!!animeTheme} onChange={handleAnimeThemeToggle} />}
            />
          </FormGroup>
        </Paper>
      </SettingsLayout>
    </React.StrictMode>
  )
}

export default About
