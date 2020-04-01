import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'
import FileManager from '../../../imports/dashboard/files/files'

const Files: NextPage<{ path: string }> = (props: { path: string }) => {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(true)

  // Check if the user is authenticated.
  useEffect(() => { authWrapperCheck().then(e => setAuthenticated(e || false)) }, [])

  return (
    <React.StrictMode>
      {/* TODO: Require uniformity in Title descriptions. */}
      <Title
        title='Files - Ecthelion'
        description='The files of a process running on Octyne.'
        url={`/dashboard/${router.query.server}/files`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!authenticated ? <AuthFailure /> : <FileManager path={props.path} />}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

const arrToStr = (e: string | string[]) => Array.isArray(e) ? e[0] : e
const es = (str?: string) => str && (str.startsWith('/') ? '' : '/') + str + (str.endsWith('/') ? '' : '/')
Files.getInitialProps = async (ctx) => Promise.resolve({ path: es(arrToStr(ctx.query.path)) || '/' })

export default Files
