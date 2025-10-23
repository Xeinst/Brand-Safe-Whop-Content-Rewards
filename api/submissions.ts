// API route for submission management
import { query } from './database'
import { z } from 'zod'

// Validation schemas
const createSubmissionSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  storageKey: z.string().min(1),
  thumbKey: z.string().optional(),
  campaignId: z.string().uuid().optional()
})

export default async function handler(req: any, res: any) {
  const { method } = req

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Submissions API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetSubmissions(req: any, res: any) {
  const { userId, status, public_only } = req.query

  let queryText = `
    SELECT 
      cs.*,
      u.username,
      u.display_name,
      c.name as campaign_name
    FROM content_submissions cs 
    LEFT JOIN users u ON cs.creator_id = u.id 
    LEFT JOIN campaigns c ON cs.campaign_id = c.id
    WHERE 1=1
  `
  const params: any[] = []
  let paramCount = 0

  if (userId) {
    paramCount++
    queryText += ` AND cs.creator_id = $${paramCount}`
    params.push(userId)
  }

  if (status) {
    paramCount++
    queryText += ` AND cs.status = $${paramCount}`
    params.push(status)
  }

  // Filter by visibility for public queries
  if (public_only === 'true') {
    queryText += ` AND cs.status = 'approved' AND cs.visibility = 'public'`
  }

  queryText += ' ORDER BY cs.created_at DESC'

  const result = await query(queryText, params)
  return res.json(result.rows)
}

async function handleCreateSubmission(req: any, res: any) {
  const body = createSubmissionSchema.parse(req.body)
  
  // Mock user - replace with actual auth
  const userId = 'user-123'

  // Force new submissions to PENDING_REVIEW and PRIVATE
  const result = await query(`
    INSERT INTO content_submissions (
      creator_id, campaign_id, storage_key, thumb_key, title, description, 
      status, visibility, private_video_link
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    userId,
    body.campaignId,
    body.storageKey,
    body.thumbKey,
    body.title,
    body.description,
    'pending_review',
    'private',
    body.storageKey // Using storage key as private link for now
  ])

  return res.status(201).json(result.rows[0])
}