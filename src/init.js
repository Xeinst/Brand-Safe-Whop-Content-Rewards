// External initialization script to avoid CSP violations
console.log('🚀 [INIT] HTML loaded, starting modern script execution')
console.log('🪟 [INIT] Window location:', window.location.href)
console.log('🪟 [INIT] Document ready state:', document.readyState)

// Check if we're in a WHOP environment
const isWhopEnvironment = window.parent !== window || 
                          window.location.hostname.includes('whop.com') ||
                          window.location.hostname.includes('vercel.app')

console.log('🎯 [INIT] WHOP environment detected:', isWhopEnvironment)
console.log('🔄 [INIT] Modern Whop SDK will be initialized by React app')
