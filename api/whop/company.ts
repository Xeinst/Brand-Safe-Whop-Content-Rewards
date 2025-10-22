// API endpoint to get current company from Whop
export default async function handler(req: any, res: any) {
  const { method } = req

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get company data from Whop API
    const whopAppId = process.env.WHOP_APP_ID
    const whopAppSecret = process.env.WHOP_APP_SECRET

    if (!whopAppId || !whopAppSecret) {
      return res.status(500).json({ error: 'Whop credentials not configured' })
    }

    // In a real implementation, you would get the company from the Whop session
    // For now, we'll return mock data that matches Whop's company structure
    const companyData = {
      id: 'whop-company-' + Math.random().toString(36).substr(2, 9),
      name: 'Whop Community',
      description: 'Brand-safe content rewards community',
      logo_url: 'https://via.placeholder.com/100'
    }

    return res.json(companyData)
  } catch (error) {
    console.error('Error fetching company from Whop:', error)
    return res.status(500).json({ error: 'Failed to fetch company data' })
  }
}
