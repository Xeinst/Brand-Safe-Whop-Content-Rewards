import { WhopSDKProvider } from './lib/whop-sdk'
import { AppRouter } from './AppRouter'
import './whop-brand.css'

function App() {
  return (
    <div className="whop-app">
      <WhopSDKProvider>
        <AppRouter />
      </WhopSDKProvider>
    </div>
  )
}

export default App
