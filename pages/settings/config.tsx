import React, { useState, useEffect, useCallback } from 'react'

import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material'

import config from '../../imports/config'
import useKy from '../../imports/helpers/useKy'
import Title from '../../imports/helpers/title'
import Message from '../../imports/helpers/message'
import Editor from '../../imports/dashboard/files/editor'
import AuthFailure from '../../imports/errors/authFailure'
import NotExistsError from '../../imports/errors/notExistsError'
import useOctyneData from '../../imports/dashboard/useOctyneData'
import ConfirmDialog from '../../imports/settings/confirmDialog'
import SettingsLayout from '../../imports/settings/settingsLayout'
import ConnectionFailure from '../../imports/errors/connectionFailure'
import { useRouter } from 'next/router'

const confirmDialogWarning =
  'Are you sure you want to do this? Make sure the config is correct, \
or you may be logged out and be unable to log back in, accidentally terminate an app or worse!'

const ConfigPage = (): React.JSX.Element => {
  const { node, nodeExists } = useOctyneData()
  const ky = useKy(node)
  const router = useRouter()

  const [message, setMessage] = useState('')
  const [fileContent, setFileContent] = useState<string | null>('')
  const [listening, setListening] = useState<boolean | null>(null)
  const [authenticated, setAuthenticated] = useState(true)
  // false = no, true = reload, string = save
  const [confirmDialog, setConfirmDialog] = useState<boolean | string>(false)

  const loadConfig = useCallback(async () => {
    if (!nodeExists) return
    setListening(null)
    try {
      const res = await ky.get('config')
      if (res.status === 401) setAuthenticated(false)
      else if (res.ok || res.status === 404) {
        const config = await res.text()
        setListening(true)
        setAuthenticated(true)
        setFileContent(res.status === 404 ? null : config)
      } else setListening(false)
    } catch (e) {
      console.error(e)
      setListening(false)
    }
  }, [ky, nodeExists])

  useEffect(() => {
    loadConfig().catch(console.error)
  }, [loadConfig])

  const saveConfig = async (content: string): Promise<void> => {
    try {
      const r = await ky.patch('config', { body: content })
      if (r.status !== 200) setMessage((await r.json<{ error: string }>()).error)
      else setMessage('Saved successfully!')
    } catch (e) {
      setMessage('Failed to save config!')
      console.error(e)
    }
  }

  const reloadFromDisk = async (): Promise<void> =>
    await ky
      .get('config/reload', { throwHttpErrors: true })
      .then(async () => await loadConfig())
      .then(() => setMessage('Successfully reloaded config!'))
      .catch(err => {
        console.error(err)
        setMessage('An error occurred reloading Octyne!')
      })

  return (
    <React.StrictMode>
      <Title
        title='Configuration - Ecthelion'
        description="Configure Octyne's settings from here."
        url='/settings/config'
      />
      <SettingsLayout loggedIn={authenticated}>
        {!nodeExists ? (
          <NotExistsError node />
        ) : !authenticated ? (
          <AuthFailure />
        ) : !listening ? (
          <ConnectionFailure loading={listening === null} />
        ) : (
          <>
            <Paper style={{ padding: 20 }}>
              <Typography variant='h5' gutterBottom style={{ marginBottom: '1em' }}>
                Manage Octyne
              </Typography>
              <FormControl fullWidth>
                <InputLabel id='octyne-node-select-label' color='secondary'>
                  Octyne Node
                </InputLabel>
                <Select
                  labelId='octyne-node-select-label'
                  id='octyne-node-select'
                  value={node ?? ''}
                  label='Octyne Node'
                  color='secondary'
                  defaultValue=''
                  onChange={node => {
                    router
                      .replace(
                        { query: node.target.value ? { node: node.target.value } : {} },
                        '/settings/config',
                      )
                      .catch(console.error)
                  }}
                >
                  <MenuItem value='' selected={(node ?? '') === ''}>
                    Primary Octyne server
                  </MenuItem>
                  {Object.keys(config.nodes ?? {}).map(n => (
                    <MenuItem key={n} value={n} selected={node === n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {fileContent !== null && (
                <Button
                  variant='contained'
                  color='secondary'
                  fullWidth
                  style={{ marginTop: '1em' }}
                  onClick={() => setConfirmDialog(true)}
                >
                  Read config from disk and reload
                </Button>
              )}
            </Paper>
            <br />
            {fileContent === null ? (
              <Paper style={{ padding: 10 }}>
                <Typography>
                  This feature requires Octyne 1.1 or newer
                  {node ? ', and this node is outdated' : ''}!
                </Typography>
                <a
                  href='https://github.com/retrixe/octyne/releases'
                  style={{ textDecoration: 'underline', color: 'inherit' }}
                >
                  <Typography>
                    Update Octyne to be able to manage its config from Ecthelion.
                  </Typography>
                </a>
              </Paper>
            ) : (
              <Paper style={{ padding: 20 }}>
                <Editor
                  name={`config.json${node ? ` on node ${node}` : ''}`}
                  content={fileContent}
                  siblingFiles={[]}
                  onSave={(name, content) => setConfirmDialog(content)}
                  onClose={setContent => setContent(fileContent)}
                  onDownload={() => {
                    const element = document.createElement('a')
                    ky.get('config', { throwHttpErrors: true })
                      .text()
                      .then(text => {
                        const config = encodeURIComponent(text)
                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + config)
                        element.setAttribute('download', 'config.json')
                        element.style.display = 'none'
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      })
                      .catch(e => {
                        setMessage('Failed to download config!')
                        console.error(e)
                      })
                  }}
                  closeText='Undo Changes'
                />
                {message && <Message message={message} setMessage={setMessage} />}
              </Paper>
            )}
          </>
        )}
      </SettingsLayout>
      <ConfirmDialog
        open={confirmDialog === true}
        title='Reload config from disk?'
        prompt={confirmDialogWarning}
        onConfirm={() => {
          reloadFromDisk().then(
            () => setConfirmDialog(false),
            () => {},
          )
        }}
        onCancel={() => setConfirmDialog(false)}
      />
      <ConfirmDialog
        open={typeof confirmDialog === 'string'}
        title='Save config?'
        prompt={confirmDialogWarning}
        onConfirm={() => {
          saveConfig(confirmDialog as string).then(
            () => setConfirmDialog(false),
            () => {},
          )
        }}
        onCancel={() => setConfirmDialog(false)}
      />
    </React.StrictMode>
  )
}

export default ConfigPage
