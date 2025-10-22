import { useEffect, useState } from 'react'
import { WhopApp, WhopSDK, WhopSDKWrapper, MockWhopSDK, useWhopSDK } from './lib/whop-sdk'
import { ExperienceView } from './components/ExperienceView'
import { DiscoverView } from './components/DiscoverView'
import { MemberStatsView } from './components/MemberStatsView'
import { ContentRewardsDashboard } from './components/ContentRewardsDashboard'
import { ContentCreatorView } from './components/ContentCreatorView'
import { ContentSubmissionView } from './components/ContentSubmissionView'
import { BrandModerationView } from './components/BrandModerationView'
import { CPMPayoutView } from './components/CPMPayoutView'
import { CampaignManagement } from './components/CampaignManagement'
import { AllSubmissionsView } from './components/AllSubmissionsView'
import { MySubmissionsView } from './components/MySubmissionsView'
import { WhopAuth } from './components/WhopAuth'
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
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <h1 className="text-2xl font-bold mb-4 text-whop-dragon-fire">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        )
      }

      if (!sdk) {
        return (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <h1 className="text-2xl font-bold mb-4 text-whop-dragon-fire">SDK Not Available</h1>
              <p className="text-gray-600">Whop SDK could not be initialized</p>
            </div>
          </div>
        )
      }

  return (
    <WhopApp sdk={sdk}>
      <WhopAuth>
        <AppRouter />
      </WhopAuth>
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

  // Route to appropriate component based on path and user role
  const renderCurrentView = () => {
    // If no specific path, route based on user role
    if (currentPath === '/' || currentPath === '/dashboard') {
      if (sdk?.isOwner()) {
        return <ContentRewardsDashboard />
      } else if (sdk?.isMember()) {
        return <ContentCreatorView />
      } else {
        // Default to member view if role is unclear
        return <ContentCreatorView />
      }
    }

    // Handle specific paths with role-based access control
    switch (currentPath) {
      case '/owner':
      case '/dashboard':
        // Only owners can access owner dashboard
        if (sdk?.isOwner()) {
          return <ContentRewardsDashboard />
        } else {
          return <ContentCreatorView />
        }
      case '/creator':
      case '/member':
        // Both owners and members can access creator view
        return <ContentCreatorView />
      case '/submit':
        // Both owners and members can submit content
        return <ContentSubmissionView />
      case '/moderate':
        // Only owners can moderate content
        if (sdk?.isOwner()) {
          return <BrandModerationView />
        } else {
          return <ContentCreatorView />
        }
      case '/payouts':
        // Only owners can access payouts
        if (sdk?.isOwner()) {
          return <CPMPayoutView />
        } else {
          return <ContentCreatorView />
        }
      case '/experiences':
        // Both owners and members can access experiences
        return <ExperienceView />
      case '/discover':
        // Both owners and members can access discover
        return <DiscoverView />
      case '/dashboard/member-stats':
        // Only owners can access member stats
        if (sdk?.isOwner()) {
          return <MemberStatsView />
        } else {
          return <ContentCreatorView />
        }
      case '/campaigns':
        // Only owners can manage campaigns
        if (sdk?.isOwner()) {
          return <CampaignManagement />
        } else {
          return <ContentCreatorView />
        }
      case '/all-submissions':
        // Only owners can see all submissions
        if (sdk?.isOwner()) {
          return <AllSubmissionsView />
        } else {
          return <ContentCreatorView />
        }
      case '/my-submissions':
        // Both owners and members can see their own submissions
        return <MySubmissionsView />
      default:
        // Default based on user role
        if (sdk?.isOwner()) {
          return <ContentRewardsDashboard />
        } else if (sdk?.isMember()) {
          return <ContentCreatorView />
        } else {
          return <ContentCreatorView />
        }
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
