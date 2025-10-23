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
  } else if (pathname.startsWith('/api/admin/review-queue')) {
    const reviewQueueHandler = await import('./admin/review-queue')
    return reviewQueueHandler.default(req, res)
  } else if (pathname.includes('/api/admin/submissions/') && pathname.includes('/approve')) {
    const approveHandler = await import('./admin/submissions/[id]/approve')
    return approveHandler.default(req, res)
  } else if (pathname.includes('/api/admin/submissions/') && pathname.includes('/reject')) {
    const rejectHandler = await import('./admin/submissions/[id]/reject')
    return rejectHandler.default(req, res)
  } else if (pathname.startsWith('/api/events/view')) {
    const viewHandler = await import('./events/view')
    return viewHandler.default(req, res)
  } else if (pathname.startsWith('/api/secure-content')) {
    const secureContentHandler = await import('./secure-content')
    return secureContentHandler.default(req, res)
  } else if (pathname.startsWith('/api/admin/campaigns')) {
    const campaignsHandler = await import('./admin/campaigns')
    return campaignsHandler.default(req, res)
  } else if (pathname.includes('/api/admin/campaigns/') && pathname.includes('/toggle')) {
    const toggleHandler = await import('./admin/campaigns/[id]/toggle')
    return toggleHandler.default(req, res)
  } else if (pathname.startsWith('/api/me/submissions')) {
    const mySubmissionsHandler = await import('./me/submissions')
    return mySubmissionsHandler.default(req, res)
  } else if (pathname.startsWith('/api/earnings/summary')) {
    const earningsHandler = await import('./earnings/summary')
    return earningsHandler.default(req, res)
  } else if (pathname.startsWith('/api/payouts/run')) {
    const runPayoutsHandler = await import('./payouts/run')
    return runPayoutsHandler.default(req, res)
  } else if (pathname.includes('/api/payouts/send/')) {
    const sendPayoutHandler = await import('./payouts/send/[id]')
    return sendPayoutHandler.default(req, res)
  } else {
    res.status(404).json({ error: 'API endpoint not found' })
  }
}
