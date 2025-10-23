// Main API handler for Vercel
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`)
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Route to appropriate API handler
  if (pathname.startsWith('/api/content-rewards')) {
    const contentRewardsHandler = await import('./content-rewards')
    return contentRewardsHandler.default(req, res)
  } else if (pathname.startsWith('/api/submissions')) {
    const submissionsHandler = await import('./submissions')
    return submissionsHandler.default(req, res)
  } else if (pathname.startsWith('/api/users')) {
    const usersHandler = await import('./users')
    return usersHandler.default(req, res)
  } else if (pathname.startsWith('/api/analytics')) {
    const analyticsHandler = await import('./analytics')
    return analyticsHandler.default(req, res)
  } else if (pathname.startsWith('/api/youtube-meta')) {
    const youtubeHandler = await import('./youtube-meta')
    return youtubeHandler.default(req, res)
  } else if (pathname.startsWith('/api/events/view')) {
    const viewHandler = await import('./events/view')
    return viewHandler.default(req, res)
  } else if (pathname.startsWith('/api/secure-content')) {
    const secureContentHandler = await import('./secure-content')
    return secureContentHandler.default(req, res)
  } else if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/me/') || pathname.startsWith('/api/earnings/') || pathname.startsWith('/api/payouts/')) {
    // Route all new Whop app endpoints to consolidated handler
    const consolidatedHandler = await import('./consolidated')
    return consolidatedHandler.default(req, res)
  } else {
    res.status(404).json({ error: 'API endpoint not found' })
  }
}
