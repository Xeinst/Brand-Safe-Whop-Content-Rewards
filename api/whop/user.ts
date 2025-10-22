// API endpoint to get current user from Whop
export default async function handler(req: any, res: any) {
  const { method } = req

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user data from Whop API
    const whopAppId = process.env.WHOP_APP_ID
    const whopAppSecret = process.env.WHOP_APP_SECRET

    if (!whopAppId || !whopAppSecret) {
      return res.status(500).json({ error: 'Whop credentials not configured' })
    }

    // In a real implementation, you would get the user from the Whop session
    // For now, we'll return mock data that matches Whop's user structure
    const userData = {
      id: 'whop-user-' + Math.random().toString(36).substr(2, 9),
      username: 'whop_user',
      email: 'user@example.com',
      avatar_url: 'https://via.placeholder.com/40',
      display_name: 'Whop User',
      role: 'member', // This would be determined by Whop permissions
      permissions: ['read_content', 'write_content', 'read_analytics']
    }

    return res.json(userData)
  } catch (error) {
    console.error('Error fetching user from Whop:', error)
    return res.status(500).json({ error: 'Failed to fetch user data' })
  }
}
