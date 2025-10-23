// API route for member's own submissions
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Mock user - replace with actual auth
    const userId = 'user-123'

    const result = await query(`
      SELECT 
        cs.*,
        c.name as campaign_name,
        c.cpm_cents
      FROM content_submissions cs
      LEFT JOIN campaigns c ON cs.campaign_id = c.id
      WHERE cs.creator_id = $1
      ORDER BY cs.created_at DESC
    `, [userId])

    return res.json(result.rows)
  } catch (error) {
    console.error('My submissions API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
