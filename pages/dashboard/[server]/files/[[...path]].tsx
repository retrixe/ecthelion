import React, { useState } from 'react'
import type { NextPage } from 'next'

import AuthFailure from '../../../../imports/errors/authFailure'
import NotExistsError from '../../../../imports/errors/notExistsError'
import useOctyneData from '../../../../imports/dashboard/useOctyneData'
import DashboardLayout from '../../../../imports/dashboard/dashboardLayout'
import FileManager from '../../../../imports/dashboard/files/fileManager'

const Files: NextPage<Record<string, unknown>> = () => {
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
                  setServerExists={setServerExists}
                  setAuthenticated={setAuthenticated}
                />}
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Files
