import React from 'react'
import {
  ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, IconButton, Checkbox
} from '@mui/material'
import { useRouter } from 'next/router'
import Folder from '@mui/icons-material/Folder'
import MoreVert from '@mui/icons-material/MoreVert'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import { joinPath } from './fileUtils'

const rtd = (num: number) => Math.round(num * 100) / 100
const bytesToGb = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`
  else if (bytes < (1024 * 1024)) return `${rtd(bytes / 1024)} KB`
  else if (bytes < (1024 * 1024 * 1024)) return `${rtd(bytes / (1024 * 1024))} MB`
  else if (bytes < (1024 * 1024 * 1024 * 1024)) return `${rtd(bytes / (1024 * 1024 * 1024))} GB`
  else return `${rtd(bytes / (1024 * 1024 * 1024 * 1024))} TB`
}
const tsts = (ts: number) => new Date(ts * 1000).toISOString().substr(0, 19).replace('T', ' ')

export interface File {
  name: string
  size: number
  folder: boolean
  lastModified: number
  mimeType: string
}

const FileListItem = ({ file, disabled, filesSelected, onItemClick, onCheck, openMenu, url }: {
  file: File
  url: string
  disabled: boolean
  filesSelected: string[]
  onCheck: React.MouseEventHandler<HTMLButtonElement>
  onItemClick: React.MouseEventHandler<HTMLDivElement>
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void
}) => (
  <a href={url} onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'inherit' }}>
    <ListItem
      key={file.name} disablePadding secondaryAction={
        <div>
          <IconButton
            disabled={disabled} onClick={e => openMenu(file.name, e.currentTarget)} size='large'
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
    }
    >
      <ListItemButton dense style={{/* paddingRight: 96 */}} disabled={disabled} onClick={onItemClick}>
        <ListItemAvatar>
          <Avatar>{file.folder ? <Folder /> : <InsertDriveFile />}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={file.name}
          secondary={`Last modified ${tsts(file.lastModified)} | Size: ${bytesToGb(file.size)}`}
          secondaryTypographyProps={{/* variant: 'caption' */}}
        />
      </ListItemButton>
    </ListItem>
  </a>
)
const FileListItemMemo = React.memo(FileListItem)

const FileList = ({ files, path, onClick, openMenu, filesSelected, setFilesSelected, disabled }: {
  files: File[]
  path: string
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void
  onClick: (name: File) => void
  filesSelected: string[]
  setFilesSelected: (filesSelected: string[]) => void
  disabled: boolean
}) => {
  const router = useRouter()

  // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  return (
    <div style={{ /* maxHeight: '60vh', */ listStyle: 'none', paddingTop: 8, paddingBottom: 8 }}>
      {files.length ? files.sort((a, b) => {
        if (a.folder && !b.folder) return -1
        else if (!a.folder && b.folder) return 1
        else return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1)
      }).map(file => (
        <FileListItemMemo
          file={file}
          key={file.name}
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
          url={`/dashboard/${router.query.server}/files${
            file.folder ? joinPath(path, file.name) : path
          }${typeof router.query.node === 'string' ? '?node=' + router.query.node : ''}`}
        />
      )) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
    </div>
  )
}

export default FileList
