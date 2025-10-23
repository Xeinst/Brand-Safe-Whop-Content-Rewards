// API route for rejecting submissions
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../../../database'
import { adminOnly } from '../../../../lib/whop-authz'
import { z } from 'zod'

const rejectSubmissionSchema = z.object({
  note: z.string().min(1)
})

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
    return res.status(400).json({ error: 'Missing submission id' })
  }

  try {
    // Mock user - replace with actual auth
    const user = { id: 'user-123', role: 'owner', companyId: 'company-123' }
    
    if (!await adminOnly(user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const body = rejectSubmissionSchema.parse(req.body)

    // Reject the submission: set status=REJECTED, visibility=PRIVATE, rejectedAt=now()
    const result = await query(`
      UPDATE content_submissions 
      SET 
        status = 'rejected',
        visibility = 'private',
        reviewed_by = $1,
        rejected_at = NOW(),
        approved_at = NULL,
        review_note = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [user.id, body.note, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    console.error('Reject submission API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}