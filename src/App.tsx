import { WhopSDKProvider } from './lib/whop-sdk'
import { AppRouter } from './AppRouter'

function App() {
  return (
    <WhopSDKProvider>
      <AppRouter />
    </WhopSDKProvider>
  )
}

export default App
