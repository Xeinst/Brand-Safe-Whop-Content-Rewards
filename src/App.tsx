import React, { useEffect, useState } from 'react'
import { WhopApp, WhopSDK, WhopSDKWrapper, MockWhopSDK } from './lib/whop-sdk'
import { ExperienceView } from './components/ExperienceView'
import { DiscoverView } from './components/DiscoverView'
import { DashboardView } from './components/DashboardView'
import { ContentSubmissionView } from './components/ContentSubmissionView'
import { BrandModerationView } from './components/BrandModerationView'
import { CPMPayoutView } from './components/CPMPayoutView'
import { AnalyticsView } from './components/AnalyticsView'
import { NotificationSystem, ToastNotification } from './components/NotificationSystem'
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
  const [currentView, setCurrentView] = useState<'experience' | 'discover' | 'dashboard' | 'submit' | 'moderate' | 'payouts' | 'analytics'>('experience')
  const [toastNotification, setToastNotification] = useState<any>(null)

  const renderView = () => {
    switch (currentView) {
      case 'experience':
        return <ExperienceView />
      case 'discover':
        return <DiscoverView />
      case 'dashboard':
        return <DashboardView />
      case 'submit':
        return <ContentSubmissionView />
      case 'moderate':
        return <BrandModerationView />
      case 'payouts':
        return <CPMPayoutView />
      case 'analytics':
        return <AnalyticsView />
      default:
        return <ExperienceView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-whop-primary">Content Rewards</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('experience')}
                  className={`${
                    currentView === 'experience'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Experience
                </button>
                <button
                  onClick={() => setCurrentView('submit')}
                  className={`${
                    currentView === 'submit'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Earn Rewards
                </button>
                <button
                  onClick={() => setCurrentView('moderate')}
                  className={`${
                    currentView === 'moderate'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Moderate
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`${
                    currentView === 'dashboard'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('payouts')}
                  className={`${
                    currentView === 'payouts'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Payouts
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`${
                    currentView === 'analytics'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setCurrentView('discover')}
                  className={`${
                    currentView === 'discover'
                      ? 'border-whop-primary text-whop-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Discover
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      
      {/* Toast Notifications */}
      <ToastNotification 
        notification={toastNotification} 
        onClose={() => setToastNotification(null)} 
      />
    </div>
  )
}

export default App
