import { WhopSDKProvider } from './lib/whop-sdk'
import { AppRouter } from './AppRouter'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DebugPanel } from './components/DebugPanel'
import './whop-brand.css'

function App() {
  console.log('🚀 [APP] App component rendering - Vercel Cache Bust v1.0.1')
  console.log('🪟 [APP] Window location:', window.location.href)
  console.log('🪟 [APP] Document ready state:', document.readyState)
  console.log('🪟 [APP] User agent:', navigator.userAgent)
  console.log('🕒 [APP] Build timestamp:', new Date().toISOString())
  
  return (
    <div className="whop-app">
      <ErrorBoundary>
        <WhopSDKProvider>
          <ErrorBoundary>
            <AppRouter />
            <DebugPanel />
          </ErrorBoundary>
        </WhopSDKProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App
