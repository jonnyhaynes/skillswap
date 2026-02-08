import { Component, type ErrorInfo, type ReactNode } from 'react'
import Bugsnag from '@bugsnag/js'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    if (Bugsnag.isStarted()) {
      Bugsnag.notify(error, (event) => {
        event.addMetadata('react', { componentStack: errorInfo.componentStack })
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-slate-600">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = '/'
              }}
              className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
