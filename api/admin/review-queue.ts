// API route for admin review queue
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
    // Get submissions that need review (PENDING_REVIEW or FLAGGED)
    const result = await query(`
      SELECT 
        cs.*,
        u.username,
        u.display_name,
        u.avatar_url,
        cr.name as reward_name,
        cr.cpm
      FROM content_submissions cs
      LEFT JOIN users u ON cs.user_id = u.id
      LEFT JOIN content_rewards cr ON cs.content_reward_id = cr.id
      WHERE cs.status IN ('pending_review', 'flagged')
      ORDER BY cs.submission_date ASC
    `)

    return res.json(result.rows)
  } catch (error) {
    console.error('Review queue API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
