import React, { useEffect, useState } from 'react'
import {
  Typography,
  Button,
  TextField,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material'
import GetApp from '@mui/icons-material/GetApp'
import CodeMirror, { type Extension } from '@uiw/react-codemirror'
import { materialDark, materialLight } from '@uiw/codemirror-theme-material'
import { languages } from '@codemirror/language-data'

const getLanguageFromExtension = (extension: string): Promise<Extension> | undefined => {
  const language = languages.find(lang => lang.extensions.includes(extension))
  if (language?.name === 'Markdown')
    return import('@codemirror/lang-markdown').then(m =>
      m.markdown({ base: m.markdownLanguage, codeLanguages: languages }),
    )
  if (language?.name === 'JavaScript')
    return import('@codemirror/lang-javascript').then(m => m.javascript({ jsx: true }))
  return language?.load()
}

const Editor = (props: {
  name: string
  content: string
  siblingFiles: string[]
  onSave: (name: string, content: string) => Promise<void> | void
  onDownload: () => void
  onClose: (setContent: React.Dispatch<React.SetStateAction<string>>) => void
  saveText?: string
  closeText?: string
}): React.JSX.Element => {
  const [language, setLanguage] = useState<Extension | undefined>()
  const [content, setContent] = useState(props.content)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(props.name)
  const error = props.name === '' && props.siblingFiles.includes(name)

  const saveFile = (): void => {
    setSaving(true)
    Promise.resolve(props.onSave(name, content))
      .then(() => setSaving(false))
      .catch(console.error)
  }

  useEffect(() => {
    const extension = name.split('.').pop()
    if (extension) getLanguageFromExtension(extension)?.then(setLanguage).catch(console.error)
  }, [name])

  // TODO: use flex: 1 on the parent Papers and resize codemirror automatically
  return (
    <>
      <div style={{ display: 'flex' }}>
        {props.name ? (
          <Typography variant='h5' gutterBottom>
            {name}
          </Typography>
        ) : (
          <TextField
            size='small'
            value={name}
            error={error}
            label='Filename'
            variant='outlined'
            onChange={e => setName(e.target.value)}
            helperText={
              error
                ? 'This file already exists! Go back and open the file directly or delete it.'
                : undefined
            }
          />
        )}
        <div style={{ flex: 1 }} />
        {props.name && (
          <Tooltip title='Download'>
            <IconButton onClick={props.onDownload}>
              <GetApp />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div style={{ flex: 1, marginTop: 10, marginBottom: 20 }}>
        <CodeMirror
          height='65vh'
          value={content}
          theme={(useTheme().palette.mode === 'dark' ? materialDark : materialLight) as Extension}
          extensions={[...(language ? [language] : [])]}
          onChange={value => setContent(value)}
        />
      </div>
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Button variant='outlined' onClick={() => props.onClose(setContent)}>
          {props.closeText ?? 'Close'}
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving || error} color='secondary' onClick={saveFile}>
          {props.saveText ?? 'Save'}
        </Button>
      </div>
      {saving && (
        <div style={{ paddingTop: 10 }}>
          <LinearProgress color='secondary' />
        </div>
      )}
    </>
  )
}

export default Editor
