// API route for earnings summary
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
    const { period, userId } = req.query

    if (!period || !userId) {
      return res.status(400).json({ error: 'Missing period or userId parameter' })
    }

    // Parse period (YYYY-MM format)
    const [year, month] = (period as string).split('-')
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Get earnings summary for the period
    const result = await query(`
      SELECT 
        cs.id as submission_id,
        cs.title,
        cs.views,
        cs.approved_at,
        c.name as campaign_name,
        c.cpm_cents,
        (cs.views * c.cpm_cents / 1000) as earnings_cents
      FROM content_submissions cs
      LEFT JOIN campaigns c ON cs.campaign_id = c.id
      WHERE cs.creator_id = $1
        AND cs.status = 'approved'
        AND cs.visibility = 'public'
        AND cs.approved_at >= $2
        AND cs.approved_at <= $3
      ORDER BY cs.approved_at DESC
    `, [userId, startDate, endDate])

    // Calculate totals
    const totalEarnings = result.rows.reduce((sum, row) => sum + (row.earnings_cents || 0), 0)
    const totalViews = result.rows.reduce((sum, row) => sum + (row.views || 0), 0)

    return res.json({
      period,
      totalEarnings,
      totalViews,
      submissions: result.rows,
      summary: {
        totalEarningsCents: totalEarnings,
        totalViews,
        submissionCount: result.rows.length
      }
    })
  } catch (error) {
    console.error('Earnings summary API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
