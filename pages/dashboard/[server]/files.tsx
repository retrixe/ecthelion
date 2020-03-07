import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import authWrapperCheck from '../../../imports/dashboard/authWrapperCheck'
import FileManager from '../../../imports/dashboard/files/files'

const Files = () => {
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
          {!authenticated ? <AuthFailure /> : <FileManager />}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Files
