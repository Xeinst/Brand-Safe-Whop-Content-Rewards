// API route for running payouts
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../database'
import { adminOnly } from '../../lib/whop-authz'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

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

  try {
    // Mock user - replace with actual auth
    const user = { id: 'user-123', role: 'owner', companyId: 'company-123' }
    
    if (!await adminOnly(user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { period } = req.query

    if (!period) {
      return res.status(400).json({ error: 'Missing period parameter' })
    }

    // Parse period (YYYY-MM format)
    const [year, month] = (period as string).split('-')
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Get all creators with earnings for the period
    const creators = await query(`
      SELECT 
        cs.creator_id,
        u.username,
        u.display_name,
        SUM(cs.views * c.cpm_cents / 1000) as total_earnings_cents,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'submission_id', cs.id,
            'title', cs.title,
            'views', cs.views,
            'cpm_cents', c.cpm_cents,
            'earnings_cents', cs.views * c.cpm_cents / 1000
          )
        ) as breakdown
      FROM content_submissions cs
      LEFT JOIN campaigns c ON cs.campaign_id = c.id
      LEFT JOIN users u ON cs.creator_id = u.id
      WHERE cs.status = 'approved'
        AND cs.visibility = 'public'
        AND cs.approved_at >= $1
        AND cs.approved_at <= $2
      GROUP BY cs.creator_id, u.username, u.display_name
      HAVING SUM(cs.views * c.cpm_cents / 1000) > 0
    `, [startDate, endDate])

    // Create payout records
    const payoutIds = []
    for (const creator of creators.rows) {
      const payout = await query(`
        INSERT INTO payouts (
          creator_id, period_start, period_end, amount_cents, breakdown_json
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        creator.creator_id,
        startDate,
        endDate,
        creator.total_earnings_cents,
        creator.breakdown
      ])
      
      payoutIds.push(payout.rows[0].id)
    }

    return res.json({
      period,
      payoutCount: payoutIds.length,
      payoutIds,
      message: `Created ${payoutIds.length} payout records for ${period}`
    })
  } catch (error) {
    console.error('Run payouts API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
