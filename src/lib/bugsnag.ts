import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import React from 'react'

const apiKey = import.meta.env.VITE_BUGSNAG_API_KEY

if (apiKey) {
  Bugsnag.start({
    apiKey,
    plugins: [new BugsnagPluginReact()],
    releaseStage: import.meta.env.MODE,
    enabledReleaseStages: ['production', 'staging', 'development'],
  })
}

export const BugsnagErrorBoundary = apiKey
  ? Bugsnag.getPlugin('react')!.createErrorBoundary(React)
  : null

export default Bugsnag
