// API route for sending payouts
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
    return res.status(400).json({ error: 'Missing payout id' })
  }

  try {
    // Mock user - replace with actual auth
    const user = { id: 'user-123', role: 'owner', companyId: 'company-123' }
    
    if (!await adminOnly(user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Get payout details
    const payout = await query(`
      SELECT p.*, u.username, u.display_name
      FROM payouts p
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE p.id = $1
    `, [id])

    if (payout.rows.length === 0) {
      return res.status(404).json({ error: 'Payout not found' })
    }

    const payoutData = payout.rows[0]

    if (payoutData.status !== 'pending') {
      return res.status(400).json({ error: 'Payout is not in pending status' })
    }

    // Mock external payout processing
    // In real implementation, this would call Whop API or other payment provider
    const externalRef = `whop_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update payout status
    const result = await query(`
      UPDATE payouts 
      SET 
        status = 'sent',
        external_ref = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [externalRef, id])

    return res.json({
      payout: result.rows[0],
      externalRef,
      message: 'Payout sent successfully'
    })
  } catch (error) {
    console.error('Send payout API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
