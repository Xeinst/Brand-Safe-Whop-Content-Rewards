// Main API handler for Vercel
// Remove Vercel types for compatibility

export default async function handler(req: any, res: any) {
  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`)
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Route to appropriate API handler
  if (pathname.startsWith('/api/submissions')) {
    const submissionsHandler = await import('./submissions')
    return submissionsHandler.default(req, res)
  } else if (pathname.startsWith('/api/youtube-meta')) {
    const youtubeHandler = await import('./youtube-meta')
    return youtubeHandler.default(req, res)
  } else if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/me/') || pathname.startsWith('/api/earnings/') || pathname.startsWith('/api/payouts/') || pathname.startsWith('/api/analytics') || pathname.startsWith('/api/content-rewards') || pathname.startsWith('/api/users') || pathname.startsWith('/api/secure-content') || pathname.startsWith('/api/events/view')) {
    // Route all consolidated endpoints to consolidated handler
    const consolidatedHandler = await import('./consolidated')
    return consolidatedHandler.default(req, res)
  } else {
    res.status(404).json({ error: 'API endpoint not found' })
  }
}
