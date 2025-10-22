// Whop OAuth authentication handler
export default async function handler(req: any, res: any) {
  const { method } = req

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code, state } = req.query

    if (!code) {
      // Redirect to Whop OAuth
      const whopAppId = process.env.WHOP_APP_ID
      const redirectUri = `${process.env.WHOP_APP_BASE_URL}/api/auth/whop`
      
      if (!whopAppId) {
        return res.status(500).json({ error: 'Whop app not configured' })
      }

      const authUrl = `https://whop.com/oauth/authorize?client_id=${whopAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read:user,read:company`
      
      return res.redirect(authUrl)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://whop.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.WHOP_APP_ID!,
        client_secret: process.env.WHOP_APP_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.WHOP_APP_BASE_URL}/api/auth/whop`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Get user info from Whop
    const userResponse = await fetch('https://api.whop.com/api/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userData = await userResponse.json()

    // Store user session (in production, use proper session management)
    const sessionData = {
      user: userData,
      access_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `whop_session=${JSON.stringify(sessionData)}; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokenData.expires_in}`
    ])

    // Redirect to app
    return res.redirect('/')
  } catch (error) {
    console.error('OAuth error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}
