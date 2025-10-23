// API route for tracking content views (impression ingestion)
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../database'

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
    const { submissionId, userId, timestamp } = req.body

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId' })
    }

    // Check if submission is approved and public before counting view
    const submission = await query(
      'SELECT id, status, visibility, approved_at FROM content_submissions WHERE id = $1',
      [submissionId]
    )

    if (submission.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    const sub = submission.rows[0]

    // Only count views for approved and public content
    if (sub.status !== 'approved' || sub.visibility !== 'public') {
      // Return 202 (Accepted) but don't count the view
      return res.status(202).json({ ok: true, message: 'View not counted - content not public' })
    }

    // Check if view is after approval time
    if (sub.approved_at && timestamp) {
      const viewTime = new Date(timestamp)
      const approvedTime = new Date(sub.approved_at)
      
      if (viewTime < approvedTime) {
        // View happened before approval - don't count
        return res.status(202).json({ ok: true, message: 'View not counted - before approval' })
      }
    }

    // Increment view count for approved and public content
    const result = await query(
      'UPDATE content_submissions SET views = views + 1, updated_at = NOW() WHERE id = $1 RETURNING views',
      [submissionId]
    )

    // Log the view event for analytics
    await query(
      'INSERT INTO analytics_events (user_id, company_id, event_type, event_data) VALUES ($1, $2, $3, $4)',
      [
        userId || null,
        null, // company_id would need to be looked up
        'view',
        JSON.stringify({
          submission_id: submissionId,
          timestamp: timestamp || new Date().toISOString()
        })
      ]
    )

    return res.json({ 
      ok: true, 
      views: result.rows[0].views,
      message: 'View counted successfully'
    })

  } catch (error) {
    console.error('View tracking API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
