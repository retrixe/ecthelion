import React from 'react'
import {
  ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, IconButton, Checkbox,
  useMediaQuery, type Theme
} from '@mui/material'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'
import { useRouter } from 'next/router'
import Folder from '@mui/icons-material/Folder'
import MoreVert from '@mui/icons-material/MoreVert'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import UnstyledLink from '../../helpers/unstyledLink'
import { joinPath } from './fileUtils'

const rtd = (num: number): number => Math.round(num * 100) / 100
const bytesToGb = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`
  else if (bytes < (1024 * 1024)) return `${rtd(bytes / 1024)} KB`
  else if (bytes < (1024 * 1024 * 1024)) return `${rtd(bytes / (1024 * 1024))} MB`
  else if (bytes < (1024 * 1024 * 1024 * 1024)) return `${rtd(bytes / (1024 * 1024 * 1024))} GB`
  else return `${rtd(bytes / (1024 * 1024 * 1024 * 1024))} TB`
}
const tsts = (ts: number): string => new Date(ts * 1000).toISOString().substr(0, 19).replace('T', ' ')

export interface File {
  name: string
  size: number
  folder: boolean
  lastModified: number
  mimeType: string
}

const FileListItem = ({ file, style, disabled, filesSelected, onItemClick, onCheck, openMenu, url }: {
  file: File
  url: string
  disabled: boolean
  filesSelected: string[]
  style: React.CSSProperties
  onCheck: React.MouseEventHandler<HTMLButtonElement>
  onItemClick: React.MouseEventHandler<HTMLDivElement>
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void
}): JSX.Element => (
  <UnstyledLink href={url} style={style} onClick={e => e.preventDefault()}>
    <ListItem
      key={file.name}
      title={file.name}
      disablePadding
      secondaryAction={
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
          primaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
    </ListItem>
  </UnstyledLink>
)
const FileListItemRenderer = ({ index, data, style }: ListChildComponentProps): JSX.Element => {
  const { files, path, disabled, filesSelected, setFilesSelected, openMenu, onClick } = data as FileItemData
  const router = useRouter()
  const file = files[index]
  const selectItem = (): void => {
    if (!filesSelected.includes(file.name)) setFilesSelected([...filesSelected, file.name])
    else setFilesSelected(filesSelected.filter(e => e !== file.name))
  }
  const shiftClickItem = (): void => {
    // Look for the last selected item. If none found, look for closest item to the start.
    let lastSelectedFileIdx = files.findLastIndex(e => filesSelected.includes(e.name))
    if (lastSelectedFileIdx === -1) lastSelectedFileIdx = 0 // If none found, select first item.
    // Select all items between the current item and found item. If they're already selected, skip.
    const filesToSelect =
      files.slice(Math.min(lastSelectedFileIdx, index), Math.max(lastSelectedFileIdx, index) + 1)
        .map(e => e.name)
        .filter(e => !filesSelected.includes(e))
    setFilesSelected([...filesSelected, ...filesToSelect])
  }
  const subpath = file.folder ? joinPath(path, file.name) : path
  const params = new URLSearchParams()
  if (router.query.node) params.append('node', router.query.node as string)
  if (!file.folder) params.append('file', file.name)
  return (
    <FileListItem
      style={style}
      file={file}
      key={file.name}
      disabled={disabled}
      openMenu={openMenu}
      filesSelected={filesSelected}
      onItemClick={(e) => e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey
        ? selectItem()
        : !e.ctrlKey && e.shiftKey && !e.metaKey && !e.altKey ? shiftClickItem() : onClick(file)}
      onCheck={(e) => e.shiftKey ? shiftClickItem() : selectItem()}
      url={`/dashboard/${router.query.server}/files${subpath}${params.size ? '?' : ''}${params}`}
    />
  )
}

interface FileItemData { /* eslint-disable react/no-unused-prop-types */
  files: File[]
  path: string
  disabled: boolean
  filesSelected: string[]
  setFilesSelected: (filesSelected: string[]) => void
  openMenu: (fileName: string, anchorEl: HTMLButtonElement) => void
  onClick: (name: File) => void
} /* eslint-enable react/no-unused-prop-types */

const FileList = (props: FileItemData): JSX.Element => {
  const px60 = useMediaQuery('(min-width:713px)')
  const smDisplay = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm')) // 600px
  const px60sm = useMediaQuery('(min-width:513px)')
  const px80sm = useMediaQuery('(min-width:364px)')
  const px100sm = useMediaQuery('(min-width:328px)')
  const px120sm = useMediaQuery('(min-width:288px)')
  const px140sm = useMediaQuery('(min-width:280px)')
  const itemSize = px60 ? 60 : (
    !smDisplay ? 80 : ( // Sidebar is hidden when smDisplay is true, use 60/80/100/120/140/160px.
      px60sm ? 60 : (px80sm ? 80 : (px100sm ? 100 : (px120sm ? 120 : px140sm ? 140 : 160)))
    )
  )
  const sortedList = props.files.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    if (a.folder && !b.folder) return -1
    else if (!a.folder && b.folder) return 1
    else return aName === bName ? 0 : (aName > bName ? 1 : -1)
  })
  return (
    <div style={{ flex: 1, listStyle: 'none', paddingTop: 8, paddingBottom: 8 }}>
      {props.files.length ? (
        <AutoSizer>
          {({ height, width }) => {
            return (
              <FixedSizeList
                width={width}
                height={height}
                overscanCount={5}
                itemCount={sortedList.length}
                itemSize={itemSize}
                itemData={props}
              >
                {FileListItemRenderer}
              </FixedSizeList>
            )
          }}
        </AutoSizer>
      ) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
    </div>
  )
}

export default FileList
