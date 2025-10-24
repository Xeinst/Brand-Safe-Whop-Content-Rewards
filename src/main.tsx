import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './whop-brand.css'

console.log('🚀 [MAIN] Starting app initialization')
console.log('🪟 [MAIN] Window location:', window.location.href)
console.log('🪟 [MAIN] Document ready state:', document.readyState)
console.log('🪟 [MAIN] User agent:', navigator.userAgent)

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('🚨 [GLOBAL ERROR]', event.error)
  console.error('🚨 [GLOBAL ERROR] Stack:', event.error?.stack)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 [UNHANDLED REJECTION]', event.reason)
})

// Check if root element exists
const rootElement = document.getElementById('root')
console.log('🎯 [MAIN] Root element found:', !!rootElement)
console.log('🎯 [MAIN] Root element:', rootElement)

if (!rootElement) {
  console.error('❌ [MAIN] Root element not found!')
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">Error: Root element not found</div>'
} else {
  console.log('✅ [MAIN] Root element found, creating React root')
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('✅ [MAIN] React root created successfully')

    console.log('🔄 [MAIN] Rendering App component')
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    console.log('✅ [MAIN] App component rendered successfully')
  } catch (error) {
    console.error('❌ [MAIN] Error creating React root:', error)
    document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">Error: ' + error + '</div>'
  }
}
