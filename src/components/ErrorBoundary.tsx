import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 [ERROR BOUNDARY] Caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR BOUNDARY] Error details:', error)
    console.error('🚨 [ERROR BOUNDARY] Error info:', errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // Check if error is related to SDK not being available
      const isSDKError = this.state.error?.message?.includes('WhopSDK is not available')
      
      if (isSDKError) {
        // Show fallback content when SDK is not available
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">SDK Not Available</h3>
                    <p className="text-sm text-yellow-700">Whop SDK is required to load application data</p>
                  </div>
                </div>
              </div>
              
              {/* Show empty state when SDK is not available */}
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-4xl">🔌</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Brand Safe Content Rewards</h1>
                <p className="text-lg text-gray-600 mb-8">
                  This application requires Whop SDK to function properly.
                </p>
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Required</h2>
                  <p className="text-gray-600 mb-6">
                    Please ensure you're accessing this app through the Whop platform 
                    or that the Whop SDK is properly configured.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Continue Anyway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      
      // For other errors, show the standard error UI
      return this.props.fallback || (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            </div>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
