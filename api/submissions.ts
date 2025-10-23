// API route for content submissions operations
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from './database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetSubmissions(req, res)
      case 'POST':
        return await handleCreateSubmission(req, res)
      case 'PUT':
        return await handleUpdateSubmission(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Submissions API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetSubmissions(req: any, res: any) {
  const { status, user_id, company_id, public_only } = req.query

  let queryText = `
    SELECT cs.*, u.username, u.display_name, cr.name as reward_name 
    FROM content_submissions cs 
    LEFT JOIN users u ON cs.user_id = u.id 
    LEFT JOIN content_rewards cr ON cs.content_reward_id = cr.id 
    WHERE 1=1
  `
  const params: any[] = []
  let paramCount = 0

  if (user_id) {
    paramCount++
    queryText += ` AND cs.user_id = $${paramCount}`
    params.push(user_id)
  }

  if (status) {
    paramCount++
    queryText += ` AND cs.status = $${paramCount}`
    params.push(status)
  }

  if (company_id) {
    paramCount++
    queryText += ` AND cr.company_id = $${paramCount}`
    params.push(company_id)
  }

  // Filter by visibility for public queries
  if (public_only === 'true') {
    paramCount++
    queryText += ` AND cs.status = 'approved' AND cs.visibility = 'public'`
  }

  queryText += ' ORDER BY cs.submission_date DESC'

  const result = await query(queryText, params)
  return res.json(result.rows)
}

async function handleCreateSubmission(req: any, res: any) {
  const { user_id, content_reward_id, title, description, private_video_link, public_video_link, thumbnail_url, platform } = req.body

  if (!user_id || !title || !private_video_link) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Force new submissions to PENDING_REVIEW and PRIVATE
  const result = await query(
    'INSERT INTO content_submissions (user_id, content_reward_id, title, description, private_video_link, public_video_link, thumbnail_url, platform, status, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [user_id, content_reward_id, title, description, private_video_link, public_video_link, thumbnail_url, platform || 'youtube', 'pending_review', 'private']
  )

  return res.status(201).json(result.rows[0])
}

async function handleUpdateSubmission(req: any, res: any) {
  const { id } = req.query
  const { action, reason, approved_by, review_note } = req.body

  if (!id) {
    return res.status(400).json({ error: 'Missing submission id' })
  }

  let result

  if (action === 'approve') {
    result = await query(
      'UPDATE content_submissions SET status = $1, visibility = $2, reviewed_by = $3, approved_at = NOW(), rejected_at = NULL, review_note = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      ['approved', 'public', approved_by, review_note, id]
    )
  } else if (action === 'reject') {
    result = await query(
      'UPDATE content_submissions SET status = $1, visibility = $2, reviewed_by = $3, rejected_at = NOW(), approved_at = NULL, review_note = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      ['rejected', 'private', approved_by, reason, id]
    )
  } else {
    return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' })
  }

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Submission not found' })
  }

  return res.json(result.rows[0])
}
