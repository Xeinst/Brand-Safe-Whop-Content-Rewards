// API route for analytics operations
import { query } from './database'

export default async function handler(req: any, res: any) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return await handleGetAnalytics(req, res)
      case 'POST':
        return await handleCreateAnalyticsEvent(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetAnalytics(req: any, res: any) {
  const { company_id, type, start_date, end_date } = req.query

  if (!company_id) {
    return res.status(400).json({ error: 'Missing company_id parameter' })
  }

  let queryText = `
    SELECT 
      c.id as company_id,
      c.name as company_name,
      COUNT(DISTINCT u.id) as total_members,
      COUNT(DISTINCT cs.user_id) as active_creators,
      COUNT(cs.id) as total_submissions,
      COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_content,
      COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_content,
      COUNT(CASE WHEN cs.status = 'pending_approval' THEN 1 END) as pending_content,
      SUM(cs.views) as total_views,
      SUM(cs.likes) as total_likes,
      AVG(cr.cpm) as average_cpm,
      SUM(cr.total_paid) as total_paid_out
    FROM companies c
    LEFT JOIN users u ON u.role = 'member'
    LEFT JOIN content_submissions cs ON cs.user_id = u.id
    LEFT JOIN content_rewards cr ON cr.company_id = c.id
    WHERE c.id = $1
  `
  
  const params = [company_id]
  let paramCount = 1

  if (start_date) {
    paramCount++
    queryText += ` AND cs.submission_date >= $${paramCount}`
    params.push(start_date)
  }

  if (end_date) {
    paramCount++
    queryText += ` AND cs.submission_date <= $${paramCount}`
    params.push(end_date)
  }

  queryText += ' GROUP BY c.id, c.name'

  const result = await query(queryText, params)
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Company not found' })
  }

  // Get top contributors
  const contributorsQuery = `
    SELECT 
      u.id,
      u.username,
      u.display_name,
      COUNT(cs.id) as submissions,
      COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_content,
      SUM(cs.views) as total_views,
      SUM(cs.likes) as total_likes,
      ROUND(
        (COUNT(CASE WHEN cs.status = 'approved' THEN 1 END)::DECIMAL / NULLIF(COUNT(cs.id), 0)) * 100, 
        2
      ) as approval_rate
    FROM users u
    LEFT JOIN content_submissions cs ON u.id = cs.user_id
    WHERE u.role = 'member'
    GROUP BY u.id, u.username, u.display_name
    ORDER BY submissions DESC, approved_content DESC
    LIMIT 10
  `

  const contributorsResult = await query(contributorsQuery, [])

  // Get recent activity
  const activityQuery = `
    SELECT 
      cs.id,
      cs.title,
      cs.status,
      cs.submission_date,
      cs.views,
      cs.likes,
      u.username,
      u.display_name,
      cr.name as reward_name
    FROM content_submissions cs
    LEFT JOIN users u ON cs.user_id = u.id
    LEFT JOIN content_rewards cr ON cs.content_reward_id = cr.id
    WHERE cr.company_id = $1
    ORDER BY cs.submission_date DESC
    LIMIT 20
  `

  const activityResult = await query(activityQuery, [company_id])

  const analytics = {
    ...result.rows[0],
    top_contributors: contributorsResult.rows,
    recent_activity: activityResult.rows
  }

  return res.json(analytics)
}

async function handleCreateAnalyticsEvent(req: any, res: any) {
  const { user_id, company_id, event_type, event_data } = req.body

  if (!user_id || !company_id || !event_type) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const result = await query(
    'INSERT INTO analytics_events (user_id, company_id, event_type, event_data) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, company_id, event_type, JSON.stringify(event_data || {})]
  )

  return res.status(201).json(result.rows[0])
}