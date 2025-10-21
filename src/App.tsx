import { useEffect, useState } from 'react'
import { WhopApp, WhopSDK, WhopSDKWrapper, MockWhopSDK, useWhopSDK } from './lib/whop-sdk'
import { ContentRewardsDashboard } from './components/ContentRewardsDashboard'
import { ContentCreatorView } from './components/ContentCreatorView'
import { ExperienceView } from './components/ExperienceView'
import { DiscoverView } from './components/DiscoverView'
import { DashboardView } from './components/DashboardView'
import { MemberStatsView } from './components/MemberStatsView'
import { ToastNotification } from './components/NotificationSystem'
import { LoadingSpinner } from './components/LoadingSpinner'

function App() {
  const [sdk, setSdk] = useState<WhopSDK | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Try to use the official Whop SDK first, fallback to mock for development
        const whopSDK = new WhopSDKWrapper()
        await whopSDK.init()
        setSdk(whopSDK)
      } catch (err) {
        console.error('Failed to initialize Whop SDK, falling back to mock:', err)
        try {
          const mockSDK = new MockWhopSDK()
          await mockSDK.init()
          setSdk(mockSDK)
        } catch (mockErr) {
          console.error('Failed to initialize mock SDK:', mockErr)
          setError('Failed to initialize Whop SDK')
        }
      } finally {
        setLoading(false)
      }
    }

    initSDK()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!sdk) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">SDK Not Available</h1>
          <p className="text-gray-600">Whop SDK could not be initialized</p>
        </div>
      </div>
    )
  }

  return (
    <WhopApp sdk={sdk}>
      <AppRouter />
    </WhopApp>
  )
}

function AppRouter() {
  const sdk = useWhopSDK()
  const [toastNotification, setToastNotification] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Handle routing based on current path
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  // Route to appropriate component based on path
  const renderCurrentView = () => {
    switch (currentPath) {
      case '/':
      case '/experiences':
        return <ExperienceView />
      case '/discover':
        return <DiscoverView />
      case '/dashboard':
        return <DashboardView />
      case '/dashboard/member-stats':
        return <MemberStatsView />
      default:
        // Default to experience view for unknown paths
        return <ExperienceView />
    }
  }

  return (
    <div className="min-h-screen">
      {renderCurrentView()}
      
      {/* Toast Notifications */}
      <ToastNotification 
        notification={toastNotification} 
        onClose={() => setToastNotification(null)} 
      />
    </div>
  )
}

export default App
