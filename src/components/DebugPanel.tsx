// Debug panel for monitoring SDK status and errors
import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { errorHandler } from '../lib/error-handler'
import { privacySafeAnalytics } from '../lib/privacy-safe-analytics'

export function DebugPanel() {
  const sdk = useWhopSDK()
  const [status, setStatus] = useState<any>(null)
  const [healthCheck, setHealthCheck] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [errorReports, setErrorReports] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (sdk) {
      const currentStatus = sdk.getStatus()
      setStatus(currentStatus)
      setErrorReports(errorHandler.getErrorReports())
      setAnalytics(privacySafeAnalytics.getAnalytics())
    }
  }, [sdk])

  const handleHealthCheck = async () => {
    if (sdk) {
      const result = await sdk.performHealthCheck()
      setHealthCheck(result)
    }
  }

  const clearErrors = () => {
    errorHandler.clearOldReports(0) // Clear all reports
    setErrorReports([])
    setStatus(sdk?.getStatus() || null)
  }

  const retryConnection = async () => {
    if (sdk) {
      await sdk.performHealthCheck()
      setStatus(sdk.getStatus())
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50 hover:bg-red-600"
        title="Show Debug Panel"
      >
        🐛
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Status Section */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Current Status</h4>
        {status ? (
          <div className="text-sm space-y-1">
            <div className={`flex items-center ${status.fallbackMode ? 'text-yellow-400' : 'text-green-400'}`}>
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              {status.fallbackMode ? 'Fallback Mode' : 'Normal Mode'}
            </div>
            <div>Errors: {status.errorCount}</div>
            {status.lastError && (
              <div>Last Error: {status.lastError.toLocaleTimeString()}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">No status available</div>
        )}
      </div>

      {/* Health Check Section */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Health Check</h4>
        <button
          onClick={handleHealthCheck}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm mr-2"
        >
          Check Health
        </button>
        <button
          onClick={retryConnection}
          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
        >
          Retry Connection
        </button>
        
        {healthCheck && (
          <div className="mt-2 text-sm">
            <div className={`${healthCheck.whopApi ? 'text-green-400' : 'text-red-400'}`}>
              Whop API: {healthCheck.whopApi ? 'Available' : 'Unavailable'}
            </div>
            <div className={`${healthCheck.fallbackMode ? 'text-yellow-400' : 'text-green-400'}`}>
              Fallback: {healthCheck.fallbackMode ? 'Active' : 'Inactive'}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Analytics ({analytics?.summary?.totalEvents || 0})</h4>
          <button
            onClick={() => {
              privacySafeAnalytics.clearAnalytics()
              setAnalytics(privacySafeAnalytics.getAnalytics())
            }}
            className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-xs"
          >
            Clear
          </button>
        </div>
        
        {analytics ? (
          <div className="text-xs space-y-1">
            <div>Events: {analytics.summary.totalEvents}</div>
            <div>Errors: {analytics.summary.totalErrors}</div>
            <div>Page Views: {analytics.summary.totalPageViews}</div>
            {analytics.summary.lastActivity && (
              <div>Last Activity: {new Date(analytics.summary.lastActivity).toLocaleTimeString()}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No analytics data</div>
        )}
      </div>

      {/* Error Reports Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Error Reports ({errorReports.length})</h4>
          <button
            onClick={clearErrors}
            className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
          >
            Clear
          </button>
        </div>
        
        {errorReports.length > 0 ? (
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {errorReports.slice(-5).map((report, index) => (
              <div key={index} className="bg-gray-800 p-2 rounded">
                <div className="text-red-400">{report.error.message}</div>
                <div className="text-gray-400">
                  {report.context.action} - {report.timestamp.toLocaleTimeString()}
                </div>
                {report.resolution && (
                  <div className="text-yellow-400">
                    Resolution: {report.resolution.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No errors reported</div>
        )}
      </div>

      {/* Network Status */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Network Status</h4>
        <div className="text-sm">
          <div>Online: {navigator.onLine ? '✅' : '❌'}</div>
          <div>Connection: {('connection' in navigator && (navigator as any).connection?.effectiveType) || 'Unknown'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm"
        >
          Reload Page
        </button>
        <button
          onClick={() => console.log('SDK Status:', status, 'Health Check:', healthCheck, 'Errors:', errorReports)}
          className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm"
        >
          Log to Console
        </button>
      </div>
    </div>
  )
}
