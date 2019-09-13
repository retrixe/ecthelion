import React from 'react'
import {
  AppBar, Toolbar, Button, Typography, Paper, Drawer, withWidth, IconButton, List, ListItem,
  ListItemText, ListItemIcon, Divider
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import TrendingUp from '@material-ui/icons/TrendingUp'
import Settings from '@material-ui/icons/Settings'
import CallToAction from '@material-ui/icons/CallToAction'
import Storage from '@material-ui/icons/Storage'
// import DeveloperBoard from '@material-ui/icons/DeveloperBoard'
import Link from 'next/link'

import { ip } from '../config.json'
import fetch from 'isomorphic-unfetch'

import Statistics from '../components/dashboard/statistics'
import Console from '../components/dashboard/console'
import Files from '../components/dashboard/files'
import ServerProperties from '../components/dashboard/serverProperties'

type PageName = 'Statistics'|'Files'|'Properties'|'Console'
interface S {
  loggedIn: boolean, openDrawer: boolean, currentPage: PageName, server?: string
}

const description = `The dashboard for a server running with Octyne.\nOctyne is a \
dashboard which allows efficient and easy to set up server administration.`

class Dashboard extends React.Component<{ width: 'xs'|'sm'|'md'|'lg'|'xl' }, S> {
  constructor (props: { width: 'xs'|'sm'|'md'|'lg'|'xl' }) {
    super(props)
    this.state = { loggedIn: false, openDrawer: false, currentPage: 'Statistics' }
  }

  getServer () {
    const regex = new RegExp('[?&]' + 'server'.replace(/[[\]]/g, '\\$&') + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(window.location.href)
    if (!results) return null
    else if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  async componentDidMount () {
    try {
      if (
        localStorage && localStorage.getItem('token') && (await (await fetch(
          ip + '/servers',
          { headers: { 'Authorization': localStorage.getItem('token') } }
        )).json()).servers
      ) this.setState({ loggedIn: true, server: this.getServer() })
    } catch (e) {}
  }

  render () {
    // Return the code.
    let PageToLoad: any = Statistics
    if (this.state.currentPage === 'Properties') PageToLoad = ServerProperties
    else if (this.state.currentPage === 'Console') PageToLoad = Console
    else if (this.state.currentPage === 'Files') PageToLoad = Files
    const drawerVariant = this.props.width === 'xs' ? 'temporary' : 'permanent'
    return (
      <div style={{ display: 'flex' }}>
        <>
          <title>Dashboard - Octyne</title>
          {/* <meta property='og:url' content={`${rootURL}/`} /> */}
          <meta property='og:description' content={description} />
          <meta name='Description' content={description} />
        </>
        {/* The AppBar. */}
        <AppBar style={{ width: '100vw', zIndex: this.props.width !== 'xs' ? 1000000000 : 1 }}>
          <Toolbar>
            {this.props.width === 'xs' && this.state.loggedIn ? (<>
              <IconButton color='inherit' aria-label='Open drawer'
                onClick={() => this.setState({ openDrawer: !this.state.openDrawer })}
              ><MenuIcon /></IconButton>
              <div style={{ marginRight: 10 }} />
            </>) : ''}
            <Typography variant='h6' color='inherit' style={{ flex: 1 }}>Octyne</Typography>
            <Link href='/'><Button color='inherit' onClick={() => {
              try { localStorage.removeItem('token') } catch (e) {}
            }}>Logout</Button></Link>
            <div style={{ marginRight: 5 }} />
            <Link href='/servers'><Button color='inherit'>Servers</Button></Link>
          </Toolbar>
        </AppBar>
        {/* The drawer. */}
        {this.state.loggedIn ? (
          <Drawer
            variant={drawerVariant} style={{ flexShrink: 0, width: 200 }}
            open={this.state.openDrawer}
            onClose={() => this.setState({ openDrawer: false })}
          >
            {this.props.width !== 'xs' ? <div style={{ height: 64 }} /> : ''}
            <List>
              {[
                { name: 'Statistics', icon: <TrendingUp /> },
                { name: 'Console', icon: <CallToAction /> },
                { name: 'Properties', icon: <Settings /> },
                { name: 'Files', icon: <Storage /> }
              ].map((page: { name: PageName, icon: any }) => (<div key={page.name}>
                <ListItem style={{ width: 200 }} button onClick={
                  () => this.setState({ currentPage: page.name })
                }>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItem>
                <Divider />
              </div>))}
            </List>
          </Drawer>
        ) : ''}
        {/* Everything other than the drawer. */}
        <div style={drawerVariant === 'temporary' || !this.state.loggedIn ? {
          background: 'linear-gradient(to top, #fc00ff, #00dbde)', height: '100%', width: '100vw'
        } : {
          background: 'linear-gradient(to top, #fc00ff, #00dbde)',
          height: '100%',
          width: `calc(100vw - 200px)`
        }}>
          <div style={{ paddingTop: '6em', paddingLeft: 20, paddingRight: 20, minHeight: '100vh' }}>
            {!this.state.loggedIn ? (
              <Paper style={{ padding: 10 }}>
                <Typography>
                  {'It doesn\'t look like you should be here.'}
                </Typography>
                <Link href='/'>
                  <Typography color='primary' component='a' onClick={() => {
                    try { localStorage.removeItem('token') } catch (e) { }
                  }}>Consider logging in?</Typography>
                </Link>
              </Paper>
            ) : <PageToLoad server={this.state.server} />}
          </div>
        </div>
      </div>
    )
  }
}

export default withWidth()(Dashboard)
