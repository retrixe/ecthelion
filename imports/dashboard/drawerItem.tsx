import React from 'react'
import { useRouter } from 'next/router'
import { ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core'
import AnchorLink from '../helpers/anchorLink'

const DrawerItem = (props: { icon: React.ReactElement, name: string, subUrl: string }) => (
  <AnchorLink
    href={`/dashboard/[server]/${props.subUrl}`}
    as={`/dashboard/${useRouter().query.server}/${props.subUrl}`}
  >
    <ListItem style={{ width: 200 }} button>
      <ListItemIcon>{props.icon}</ListItemIcon>
      <ListItemText primary={props.name} />
    </ListItem>
    <Divider />
  </AnchorLink>
)

export default DrawerItem
