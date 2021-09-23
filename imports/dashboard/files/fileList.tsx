import React from 'react'
import {
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, Avatar, IconButton, Checkbox
} from '@mui/material'
import { useRouter } from 'next/router'
import Folder from '@mui/icons-material/Folder'
import MoreVert from '@mui/icons-material/MoreVert'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import { joinPath } from './fileUtils'

const rtd = (num: number) => Math.round(num * 100) / 100
const bytesToGb = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < (1024 * 1024)) return rtd(bytes / 1024) + ' KB'
  else if (bytes < (1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024)) + ' MB'
  else if (bytes < (1024 * 1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024 * 1024)) + ' GB'
}

export interface File {
  folder: boolean,
  name: string,
  lastModified: number,
  size: number,
  mimeType: string
}

const FileListItem = ({ file, disabled, filesSelected, onItemClick, onCheck, openMenu }: {
  file: File,
  disabled: boolean,
  filesSelected: string[],
  onCheck: React.MouseEventHandler<HTMLButtonElement>,
  onItemClick: React.MouseEventHandler<HTMLDivElement>,
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void,
}) => (
  <ListItem
    key={file.name}
    dense
    button
    disabled={disabled}
    onClick={onItemClick}
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
        <IconButton
          disabled={disabled}
          onClick={e => openMenu(file.name, e.currentTarget)}
          size='large'
        >
          <MoreVert />
        </IconButton>
        <Checkbox
          disableRipple
          disabled={disabled}
          checked={filesSelected.includes(file.name)}
          onClick={onCheck}
        />
      </div>
    </ListItemSecondaryAction>
  </ListItem>
)
const FileListItemMemo = React.memo(FileListItem)

const FileList = ({ files, path, onClick, openMenu, filesSelected, setFilesSelected, disabled }: {
  files: File[],
  path: string,
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void,
  onClick: (name: File) => void,
  filesSelected: string[],
  setFilesSelected: (filesSelected: string[]) => void,
  disabled: boolean
}) => {
  const router = useRouter()

  return (
    <List>
      {files.length ? files.sort((a, b) => {
        if (a.folder && !b.folder) return -1
        else if (!a.folder && b.folder) return 1
        else return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1)
      }).map(file => (
        <a
          key={file.name}
          href={`/dashboard/${router.query.server}/files${file.folder ? joinPath(path, file.name) : path}`}
          onClick={e => e.preventDefault()}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <FileListItemMemo
            file={file}
            disabled={disabled}
            openMenu={openMenu}
            filesSelected={filesSelected}
            onItemClick={(e) => e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey
              ? setFilesSelected(!filesSelected.includes(file.name)
                ? [...filesSelected, file.name]
                : filesSelected.filter(e => e !== file.name))
              : onClick(file)}
            onCheck={() => {
              // TODO: Support shift+click.
              if (!filesSelected.includes(file.name)) setFilesSelected([...filesSelected, file.name])
              else setFilesSelected(filesSelected.filter(e => e !== file.name))
            }}
          />
        </a>
      )) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
    </List>
  )
}

export default FileList
