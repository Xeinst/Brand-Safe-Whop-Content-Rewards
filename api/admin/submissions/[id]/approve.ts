// API route for approving submissions
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../../../database'

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
    const { reviewed_by, review_note } = req.body

    if (!reviewed_by) {
      return res.status(400).json({ error: 'Missing reviewed_by field' })
    }

    // Approve the submission: set status=APPROVED, visibility=PUBLIC, approvedAt=now()
    const result = await query(
      'UPDATE content_submissions SET status = $1, visibility = $2, reviewed_by = $3, approved_at = NOW(), rejected_at = NULL, review_note = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      ['approved', 'public', reviewed_by, review_note || null, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    console.error('Approve submission API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
