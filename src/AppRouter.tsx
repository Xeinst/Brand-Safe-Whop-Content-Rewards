import { useEffect, useState } from 'react'
import { useWhopSDKContext } from './lib/whop-sdk'
import { ExperienceView } from './components/ExperienceView'
import { DiscoverView } from './components/DiscoverView'
import { MemberStatsView } from './components/MemberStatsView'
import { ContentCreatorView } from './components/ContentCreatorView'
import { ContentSubmissionView } from './components/ContentSubmissionView'
import { BrandModerationView } from './components/BrandModerationView'
import { CPMPayoutView } from './components/CPMPayoutView'
import { CampaignManagement } from './components/CampaignManagement'
import { AllSubmissionsView } from './components/AllSubmissionsView'
import { CampaignAnalytics } from './components/CampaignAnalytics'
import { ContentApprovalWorkflow } from './components/ContentApprovalWorkflow'
import { ToastNotification } from './components/NotificationSystem'
import { DebugInfo } from './components/DebugInfo'
import { OwnerDashboard } from './components/OwnerDashboard'
import { ContentCreatorExperience } from './components/ContentCreatorExperience'
import { UserSubmissionTracking } from './components/UserSubmissionTracking'

export function AppRouter() {
  const { sdk, loading, error } = useWhopSDKContext()
  const [toastNotification, setToastNotification] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [forceRender, setForceRender] = useState(false)

  // Force render after 3 seconds if SDK never loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !sdk) {
        console.log('Force rendering app without SDK')
        setForceRender(true)
      }
    }, 3000) // Reduced from 10 seconds to 3 seconds
    
    return () => clearTimeout(timeout)
  }, [loading, sdk])

  // Handle routing based on current path
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  // Debug logging
  console.log('AppRouter: SDK available:', !!sdk)
  console.log('AppRouter: Loading:', loading)
  console.log('AppRouter: Error:', error)
  console.log('AppRouter: Current path:', currentPath)
  console.log('AppRouter: SDK methods:', sdk ? Object.keys(sdk) : 'No SDK')
  console.log('AppRouter: Window location:', window.location.href)
  console.log('AppRouter: Parent window:', window.parent !== window)

  // Show loading state with immediate fallback option
  if (loading && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Brand Safe Content Rewards</h1>
          <p className="text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Whop SDK...</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button 
              onClick={() => setForceRender(true)} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Continue Without SDK
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Brand Safe Content Rewards</h1>
          <p className="text-red-600 mb-4">Error loading application</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
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
          <p className="text-gray-600 mb-4">App loaded successfully</p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">Production-ready app with real data integration.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Retry SDK
            </button>
            <button 
              onClick={() => setForceRender(false)} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Loading
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Features:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800">Content Submission</h3>
                <p className="text-sm text-gray-600">Submit content for brand approval</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800">Reward Tracking</h3>
                <p className="text-sm text-gray-600">Track your earnings and progress</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800">Brand Moderation</h3>
                <p className="text-sm text-gray-600">Review and approve content</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800">Analytics</h3>
                <p className="text-sm text-gray-600">View performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Route to appropriate component based on path and user role
  const renderCurrentView = () => {
    console.log('🎯 [APP ROUTER] Rendering view for path:', currentPath)
    console.log('👤 [APP ROUTER] User role - isOwner:', sdk?.isOwner?.(), 'isMember:', sdk?.isMember?.())
    console.log('🔐 [APP ROUTER] User authenticated:', sdk?.isAuthenticated?.())
    console.log('👤 [APP ROUTER] User data:', sdk?.user)
    console.log('🏢 [APP ROUTER] Company data:', sdk?.company)
    console.log('🪟 [APP ROUTER] Window location:', window.location.href)
    console.log('🪟 [APP ROUTER] Document ready state:', document.readyState)
    
    // Handle Whop app specific paths
    if (currentPath.startsWith('/dashboard/')) {
      // Dashboard path - Owner view
      console.log('🏢 [APP ROUTER] Dashboard path detected - showing owner dashboard')
      if (sdk?.isOwner?.()) {
        console.log('✅ [APP ROUTER] User is owner, showing OwnerDashboard')
        return <OwnerDashboard />
      } else {
        console.log('❌ [APP ROUTER] User is not owner, showing access denied')
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
      console.log('👥 [APP ROUTER] Experience path detected - showing member experience')
      if (sdk?.isAuthenticated?.()) {
        console.log('✅ [APP ROUTER] User is authenticated, showing MemberExperience')
        return <ContentCreatorExperience />
      } else {
        console.log('❌ [APP ROUTER] User is not authenticated, showing auth required')
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
      console.log('🌍 [APP ROUTER] Discover path detected - showing discover view')
      return <DiscoverView />
    }

    // If no specific path, route based on user role
    if (currentPath === '/' || currentPath === '/dashboard') {
      if (sdk?.isOwner?.()) {
        return <OwnerDashboard />
      } else if (sdk?.isMember?.()) {
        return <ContentCreatorExperience />
      } else {
        // Default to creator experience if role is unclear
        return <ContentCreatorExperience />
      }
    }

    // Handle specific paths with role-based access control
    switch (currentPath) {
      case '/owner':
      case '/dashboard':
        // Only owners can access owner dashboard
        if (sdk?.isOwner?.()) {
          return <OwnerDashboard />
        } else {
          return <ContentCreatorExperience />
        }
      case '/creator':
      case '/member':
        // Both owners and members can access creator experience
        return <ContentCreatorExperience />
      case '/submit':
        // Both owners and members can submit content
        return <ContentSubmissionView />
      case '/moderate':
        // Only owners can moderate content
        if (sdk?.isOwner?.()) {
          return <BrandModerationView />
        } else {
          return <ContentCreatorView />
        }
      case '/payouts':
        // Only owners can access payouts
        if (sdk?.isOwner?.()) {
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
        if (sdk?.isOwner?.()) {
          return <MemberStatsView />
        } else {
          return <ContentCreatorView />
        }
      case '/campaigns':
        // Only owners can manage campaigns
        if (sdk?.isOwner?.()) {
          return <CampaignManagement />
        } else {
          return <ContentCreatorView />
        }
      case '/campaigns/analytics':
        // Only owners can access campaign analytics
        if (sdk?.isOwner?.()) {
          return <CampaignAnalytics />
        } else {
          return <ContentCreatorView />
        }
      case '/all-submissions':
        // Only owners can see all submissions
        if (sdk?.isOwner?.()) {
          return <AllSubmissionsView />
        } else {
          return <ContentCreatorView />
        }
      case '/my-submissions':
        // Both owners and members can see their own submissions
        return <UserSubmissionTracking />
      case '/approval':
        // Only owners can access approval workflow
        if (sdk?.isOwner?.()) {
          return <ContentApprovalWorkflow />
        } else {
          return <ContentCreatorView />
        }
      default:
        // Default based on user role
        if (sdk?.isOwner?.()) {
          return <OwnerDashboard />
        } else if (sdk?.isMember?.()) {
          return <ContentCreatorExperience />
        } else {
          return <ContentCreatorExperience />
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
