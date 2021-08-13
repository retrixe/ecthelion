import React from 'react'
import {
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, Avatar, IconButton, Checkbox
} from '@material-ui/core'
import { useRouter } from 'next/router'
import Folder from '@material-ui/icons/Folder'
import MoreVert from '@material-ui/icons/MoreVert'
import InsertDriveFile from '@material-ui/icons/InsertDriveFile'

const joinPath = (a: string, b: string) => {
  if (a.endsWith('/')) return a + b + '/'
  else return a + '/' + b + '/'
}

export interface File {
  folder: boolean,
  name: string,
  lastModified: number,
  size: number,
  mimeType: string
}

const FileList = ({ files, path, onClick, openMenu, filesSelected, setFilesSelected, opip }: {
  files: File[],
  path: string,
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void,
  onClick: (name: File) => void,
  filesSelected: string[],
  setFilesSelected: (filesSelected: string[]) => void,
  opip: boolean
}) => {
  const router = useRouter()
  const rtd = (num: number) => Math.round(num * 100) / 100
  const bytesToGb = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < (1024 * 1024)) return rtd(bytes / 1024) + ' KB'
    else if (bytes < (1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024)) + ' MB'
    else if (bytes < (1024 * 1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024 * 1024)) + ' GB'
  }

  return (
    <List>
      {files.length ? files.sort((a, b) => {
        if (a.folder && !b.folder) return -1
        else if (!a.folder && b.folder) return 1
        else return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1)
      }).map(file => (
        <a
          key={file.name}
          href={`/dashboard/${router.query.server}/files?path=${file.folder ? joinPath(path, file.name) : path}`}
          onClick={e => e.preventDefault()}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ListItem
            key={file.name}
            dense
            button
            disabled={opip}
            onClick={(e) => e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey
              ? setFilesSelected(!filesSelected.includes(file.name)
                ? [...filesSelected, file.name]
                : filesSelected.filter(e => e !== file.name))
              : onClick(file)}
          >
            <ListItemAvatar>
              <Avatar>
                {file.folder ? <Folder /> : <InsertDriveFile />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={file.name}
              secondary={
                'Last modified on ' +
                new Date(file.lastModified * 1000).toISOString().substr(0, 19).replace('T', ' ') +
                ' | Size: ' + bytesToGb(file.size)
              }
            />
            <ListItemSecondaryAction>
              <div>
                <IconButton disabled={opip} onClick={e => openMenu(file.name, e.currentTarget)}>
                  <MoreVert />
                </IconButton>
                <Checkbox
                  disableRipple
                  disabled={opip}
                  checked={filesSelected.includes(file.name)}
                  onClick={() => {
                    // TODO: Support shift+click.
                    if (!filesSelected.includes(file.name)) setFilesSelected([...filesSelected, file.name])
                    else setFilesSelected(filesSelected.filter(e => e !== file.name))
                  }}
                />
              </div>
            </ListItemSecondaryAction>
          </ListItem>
        </a>
      )) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
    </List>
  )
}

export default FileList
