import { WhopSDKProvider } from './lib/whop-sdk'
import { AppRouter } from './AppRouter'
import './whop-brand.css'

function App() {
  console.log('🚀 [APP] App component rendering')
  console.log('🪟 [APP] Window location:', window.location.href)
  console.log('🪟 [APP] Document ready state:', document.readyState)
  console.log('🪟 [APP] User agent:', navigator.userAgent)
  
  return (
    <div className="whop-app">
      <WhopSDKProvider>
        <AppRouter />
      </WhopSDKProvider>
    </div>
  )
}

export default App
