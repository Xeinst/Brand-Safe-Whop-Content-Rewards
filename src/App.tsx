import { useEffect, useState } from 'react'
import { WhopApp, WhopSDK, WhopSDKWrapper, MockWhopSDK } from './lib/whop-sdk'
import { RoleSelector, UserRole } from './components/RoleSelector'
import { CreatorDashboard } from './components/CreatorDashboard'
import { BrandDashboard } from './components/BrandDashboard'
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
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [toastNotification, setToastNotification] = useState<any>(null)

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
  }

  const handleRoleChange = () => {
    setUserRole(null)
  }

  if (!userRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  return (
    <div className="min-h-screen">
      {/* Role Switch Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleRoleChange}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200"
        >
          Switch Role
        </button>
      </div>

      {/* Render Appropriate Dashboard */}
      {userRole === 'creator' ? (
        <CreatorDashboard />
      ) : (
        <BrandDashboard />
      )}
      
      {/* Toast Notifications */}
      <ToastNotification 
        notification={toastNotification} 
        onClose={() => setToastNotification(null)} 
      />
    </div>
  )
}

export default App
