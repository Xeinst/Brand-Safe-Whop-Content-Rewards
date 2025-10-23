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
