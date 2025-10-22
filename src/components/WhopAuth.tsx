import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'

interface WhopAuthProps {
  children: React.ReactNode
}

export function WhopAuth({ children }: WhopAuthProps) {
  const sdk = useWhopSDK()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        
        if (!sdk) {
          setError('SDK not initialized')
          return
        }

        // Check if user is authenticated
        const authenticated = sdk.isAuthenticated()
        setIsAuthenticated(authenticated)

        if (authenticated) {
          // Sync with Whop if credentials are available
          if ('syncWithWhop' in sdk) {
            await (sdk as any).syncWithWhop()
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        setError('Authentication failed')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [sdk])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Authenticating...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Authentication Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Authentication Required</h1>
          <p className="text-gray-400 mb-6">Please authenticate with Whop to continue</p>
          <button 
            onClick={() => {
              // In production, this would redirect to Whop OAuth
              window.location.href = '/auth/whop'
            }}
            className="px-6 py-3 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Authenticate with Whop
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
