import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

import Title from '../../../imports/helpers/title'
import AuthFailure from '../../../imports/errors/authFailure'
import FileManager from '../../../imports/dashboard/files/files'
import NotExistsError from '../../../imports/errors/notExistsError'
import useOctyneData from '../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../imports/dashboard/dashboardLayout'
import { normalisePath } from '../../../imports/dashboard/files/fileUtils'

const Files: NextPage<{ path: string }> = (props: { path: string }) => {
  const router = useRouter()
  const { nodeExists } = useOctyneData()
  const [serverExists, setServerExists] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)

  const title = router.query.server ? ' - ' + router.query.server : ''
  return (
    <React.StrictMode>
      <Title
        title={`Files${title} - Ecthelion`}
        description='The files of a process running on Octyne.'
        url={`/dashboard/${router.query.server}/files`}
      />
      <DashboardLayout loggedIn={authenticated}>
        <div style={{ padding: 20 }}>
          {!nodeExists || !serverExists ? <NotExistsError node={!nodeExists} />
            : !authenticated
                ? <AuthFailure />
                : <FileManager
                    path={props.path}
                    setServerExists={setServerExists}
                    setAuthenticated={setAuthenticated}
                  />}
        </div>
      </DashboardLayout>
    </React.StrictMode>
  )
}

Files.getInitialProps = async ({ query }) => {
  const path = normalisePath((Array.isArray(query.path) ? query.path.join('/') : query.path) || '/')
  return await Promise.resolve({ path })
}

export default Files
