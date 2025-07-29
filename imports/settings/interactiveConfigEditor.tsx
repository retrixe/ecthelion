import React, { useState } from 'react'
import { Typography, Button, LinearProgress } from '@mui/material'
import CommentJSON from 'comment-json'

interface Config {
  // TODO
  redis?: {
    enabled?: boolean
  }
}

// TODO: Refresh button.
const InteractiveConfigEditor = (props: {
  title: string
  content: string
  onSave: (content: string) => Promise<void> | void
}): React.JSX.Element => {
  const [saving, setSaving] = useState(false)

  const [, setRedisEnabled] = useState<boolean | undefined>(false)

  const loadStateFromJSON = (): void => {
    const json = CommentJSON.parse(props.content) as Config
    // TODO: Load the state from the JSON object
    setRedisEnabled(json.redis?.enabled ?? false)
  }

  const saveFile = (): void => {
    setSaving(true)
    const originalJson = CommentJSON.parse(props.content) as Config
    // TODO: Apply changes to the originalJson object based on user input
    const modifiedJson = CommentJSON.stringify(originalJson, null, 2)
    Promise.resolve(props.onSave(modifiedJson))
      .then(() => setSaving(false))
      .catch(console.error)
  }

  return (
    <>
      <Typography variant='h5' gutterBottom>
        {props.title}
      </Typography>
      <div style={{ flex: 1, marginTop: 10, marginBottom: 20 }}>
        <Typography variant='body1' gutterBottom>
          This is a placeholder for the interactive config editor. It will allow you to edit your
          configuration in a user-friendly way, without needing to write JSON or YAML directly.
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Note: This feature is under development and may not be fully functional yet.
        </Typography>
      </div>
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Button variant='outlined' onClick={loadStateFromJSON}>
          Undo Changes
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant='contained' disabled={saving} color='secondary' onClick={saveFile}>
          Apply
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

export default InteractiveConfigEditor
