import React from 'react'
import {
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, Avatar, IconButton
} from '@material-ui/core'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import Folder from '@material-ui/icons/Folder'
import MoreVert from '@material-ui/icons/MoreVert'
import InsertDriveFile from '@material-ui/icons/InsertDriveFile'

const FileList = ({ files, path, setPath, openFile }: {
  files: Array<{ folder: boolean, name: string, lastModified: number, size: number }>,
  path: string,
  setPath: (path: string) => void,
  openFile: (path: string, size: number) => void
}) => {
  const rtd = (num: number) => Math.round(num * 100) / 100
  const bytesToGb = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < (1024 * 1024)) return rtd(bytes / 1024) + ' KB'
    else if (bytes < (1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024)) + ' MB'
    else if (bytes < (1024 * 1024 * 1024 * 1024)) return rtd(bytes / (1024 * 1024 * 1024)) + ' GB'
  }

  const filesSorted = files.sort((a, b) => {
    if (a.folder && !b.folder) return -1
    else if (!a.folder && b.folder) return 1
    else return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1)
  })
  return (
    <>
      {files.length ? (
        <List style={{ height: '100%', minHeight: '55vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height}
                width={width}
                className='List'
                itemCount={filesSorted.length}
                itemSize={60}
              >
                {({ index, style }) => {
                  const file = filesSorted[index]
                  return (
                    <div style={style}>
                      <ListItem
                        key={file.name}
                        dense
                        button
                        onClick={() => {
                          file.folder ? setPath(path + file.name + '/') : openFile(file.name, file.size)
                        }}
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
                          <IconButton
                            onClick={e => {
                              /*
                              setMenuOpen(file.name)
                              setAnchorEl(e.currentTarget)
                              */
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </div>
                  )
                }}
              </FixedSizeList>
            )}
          </AutoSizer>
        </List>
      ) : <ListItem><ListItemText primary='Looks like this place is empty.' /></ListItem>}
    </>
  )
}

export default FileList
