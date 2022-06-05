import React, { useState } from 'react'
import { NextPage } from 'next'

import AuthFailure from '../../../../imports/errors/authFailure'
import NotExistsError from '../../../../imports/errors/notExistsError'
import useOctyneData from '../../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../../imports/dashboard/dashboardLayout'
import { normalisePath } from '../../../../imports/dashboard/files/fileUtils'
import FileManager from '../../../../imports/dashboard/files/fileManager'

const Files: NextPage<{ path: string }> = (props: { path: string }) => {
  const { nodeExists } = useOctyneData()
  const [serverExists, setServerExists] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)

  return (
    <React.StrictMode>
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        {!nodeExists || !serverExists ? <NotExistsError node={!nodeExists} />
          : !authenticated
              ? <AuthFailure />
              : <FileManager
                  path={props.path}
                  setServerExists={setServerExists}
                  setAuthenticated={setAuthenticated}
                />}
      </DashboardLayout>
    </React.StrictMode>
  )
}

Files.getInitialProps = async ({ query }) => {
  const path = normalisePath((Array.isArray(query.path) ? query.path.join('/') : query.path) || '/')
  return await Promise.resolve({ path })
}

export default Files
