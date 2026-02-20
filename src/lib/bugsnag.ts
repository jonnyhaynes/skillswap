import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import React from 'react'

const apiKey = import.meta.env.VITE_BUGSNAG_API_KEY

let _initialized = false

/**
 * Initialise Bugsnag. Safe to call multiple times — only runs once.
 * Must be called explicitly after the user has granted cookie consent.
 */
export function initBugsnag(): void {
  if (_initialized || !apiKey) return
  _initialized = true

  Bugsnag.start({
    apiKey,
    plugins: [new BugsnagPluginReact()],
    releaseStage: import.meta.env.MODE,
    enabledReleaseStages: ['production', 'staging', 'development'],
  })
}

/**
 * Returns the Bugsnag React error boundary component if Bugsnag has been
 * started (i.e. after consent has been granted), otherwise null.
 * Called in App.tsx on each render so the boundary activates as soon as
 * Bugsnag is initialised.
 */
export function createBugsnagErrorBoundary() {
  if (!apiKey || !Bugsnag.isStarted()) return null
  return Bugsnag.getPlugin('react')!.createErrorBoundary(React)
}

export default Bugsnag
