import { useEffect, useState } from 'react'
import { useWhopSDK } from './lib/whop-sdk'
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
import { AdminReviewView } from './components/AdminReviewView'
import { ToastNotification } from './components/NotificationSystem'
import { DebugInfo } from './components/DebugInfo'

export function AppRouter() {
  const sdk = useWhopSDK()
  const [toastNotification, setToastNotification] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [forceRender, setForceRender] = useState(false)

  // Force render after 10 seconds if SDK never loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!sdk) {
        console.log('Force rendering app without SDK')
        setForceRender(true)
      }
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [sdk])

  // Debug logging
  console.log('AppRouter: SDK available:', !!sdk)
  console.log('AppRouter: Current path:', currentPath)
  console.log('AppRouter: SDK methods:', sdk ? Object.keys(sdk) : 'No SDK')
  console.log('AppRouter: Window location:', window.location.href)
  console.log('AppRouter: Parent window:', window.parent !== window)

  // Fallback if SDK is not available
  if (!sdk && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Brand Safe Content Rewards</h1>
          <p className="text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-500 mt-2">SDK not available yet</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Force render without SDK if timeout reached
  if (!sdk && forceRender) {
    console.log('Rendering app without SDK due to timeout')
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Brand Safe Content Rewards</h1>
          <p className="text-gray-600 mb-4">App loaded in fallback mode</p>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">SDK initialization failed. App is running in demo mode.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Retry
            </button>
            <button 
              onClick={() => setForceRender(false)} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

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
    console.log('Rendering view for path:', currentPath)
    console.log('User role - isOwner:', sdk?.isOwner(), 'isMember:', sdk?.isMember())
    console.log('User authenticated:', sdk?.isAuthenticated())
    console.log('User data:', sdk?.user)
    
    // Handle Whop app specific paths
    if (currentPath.startsWith('/dashboard/')) {
      // Dashboard path - Owner view
      console.log('Dashboard path detected - showing owner view')
      if (sdk?.isOwner()) {
        return <ContentRewardsDashboard />
      } else {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need owner permissions to access this dashboard.</p>
            <p className="text-sm text-gray-500 mt-2">Current role: {sdk?.user?.role || 'unknown'}</p>
          </div>
        </div>
      }
    }
    
    if (currentPath.startsWith('/experiences/')) {
      // Experience path - Member view
      console.log('Experience path detected - showing member view')
      if (sdk?.isAuthenticated()) {
        return <ContentCreatorView />
      } else {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please log in to access this experience.</p>
          </div>
        </div>
      }
    }
    
    if (currentPath.startsWith('/discover')) {
      // Discover path - Public view
      console.log('Discover path detected - showing discover view')
      return <DiscoverView />
    }

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
      case '/admin/review':
        // Only owners can access admin review
        if (sdk?.isOwner()) {
          return <AdminReviewView />
        } else {
          return <ContentCreatorView />
        }
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
      
      {/* Debug Info */}
      <DebugInfo sdk={sdk} />
    </div>
  )
}
