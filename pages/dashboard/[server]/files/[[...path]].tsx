import type { NextPage } from 'next'
import React, { useState } from 'react'
import DashboardLayout from '../../../../imports/dashboard/dashboardLayout'
import FileManager from '../../../../imports/dashboard/files/fileManager'
import useOctyneData from '../../../../imports/dashboard/useOctyneData'
import AuthFailure from '../../../../imports/errors/authFailure'
import NotExistsError from '../../../../imports/errors/notExistsError'

const Files: NextPage<Record<string, unknown>> = () => {
  const { server, node, nodeExists } = useOctyneData()
  const [serverExists, setServerExists] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)

  return (
    <React.StrictMode>
      <DashboardLayout loggedIn={nodeExists && serverExists && authenticated}>
        {!nodeExists || !serverExists ? (
          <NotExistsError node={!nodeExists} />
        ) : !authenticated ? (
          <AuthFailure />
        ) : (
          <FileManager
            key={JSON.stringify({ server, node })}
            setServerExists={setServerExists}
            setAuthenticated={setAuthenticated}
          />
        )}
      </DashboardLayout>
    </React.StrictMode>
  )
}

export default Files
