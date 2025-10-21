// API route for analytics operations
import { query } from './database'

export default async function handler(req: any, res: any) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return await handleGetAnalytics(req, res)
      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetAnalytics(req: any, res: any) {
  const { type, company_id } = req.query

  if (!company_id) {
    return res.status(400).json({ error: 'Missing company_id parameter' })
  }

  switch (type) {
    case 'member-stats':
      return await getMemberStatistics(req, res)
    case 'top-contributors':
      return await getTopContributors(req, res)
    case 'top-earners':
      return await getTopEarners(req, res)
    case 'overview':
      return await getAnalyticsOverview(req, res)
    default:
      return res.status(400).json({ error: 'Invalid analytics type' })
  }
}

async function getMemberStatistics(req: any, res: any) {
  const { company_id } = req.query

  const result = await query(
    'SELECT * FROM member_statistics WHERE company_id = $1 ORDER BY recorded_at DESC LIMIT 1',
    [company_id]
  )

  if (result.rows.length === 0) {
    // Return default stats if none exist
    return res.json({
      total_members: 0,
      active_members: 0,
      new_members: 0,
      member_engagement: 0,
      total_submissions: 0,
      approved_content: 0,
      rejected_content: 0,
      pending_review: 0,
      total_rewards_given: 0,
      average_reward: 0
    })
  }

  return res.json(result.rows[0])
}

async function getTopContributors(req: any, res: any) {
  const { company_id } = req.query
  const limit = parseInt(req.query.limit) || 10

  const result = await query(
    'SELECT * FROM top_contributors WHERE company_id = $1 ORDER BY submissions DESC LIMIT $2',
    [company_id, limit]
  )

  return res.json(result.rows)
}

async function getTopEarners(req: any, res: any) {
  const { company_id } = req.query
  const limit = parseInt(req.query.limit) || 10

  const result = await query(
    'SELECT * FROM top_earners WHERE company_id = $1 ORDER BY total_earnings DESC LIMIT $2',
    [company_id, limit]
  )

  return res.json(result.rows)
}

async function getAnalyticsOverview(req: any, res: any) {
  const { company_id } = req.query

  // Get company analytics from the view
  const result = await query(
    'SELECT * FROM company_analytics WHERE company_id = $1',
    [company_id]
  )

  if (result.rows.length === 0) {
    return res.json({
      company_id,
      company_name: 'Unknown',
      total_members: 0,
      active_creators: 0,
      total_submissions: 0,
      approved_content: 0,
      rejected_content: 0,
      pending_content: 0,
      total_views: 0,
      average_cpm: 0
    })
  }

  return res.json(result.rows[0])
}
