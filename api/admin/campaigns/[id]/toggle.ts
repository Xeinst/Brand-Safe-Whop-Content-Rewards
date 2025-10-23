// API route for toggling campaign active status
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../../../database'
import { adminOnly } from '../../../../lib/whop-authz'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req
  const { id } = req.query

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing campaign id' })
  }

  try {
    // Mock user - replace with actual auth
    const user = { id: 'user-123', role: 'owner', companyId: 'company-123' }
    
    if (!await adminOnly(user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Toggle the active status
    const result = await query(`
      UPDATE campaigns 
      SET active = NOT active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    console.error('Campaign toggle API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
