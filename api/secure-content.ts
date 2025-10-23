// API route for secure content access (private content protection)
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from './database'

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
    const { submissionId, userId } = req.query

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId' })
    }

    // Check if user has permission to access this content
    const submission = await query(
      'SELECT cs.*, u.username, u.display_name FROM content_submissions cs LEFT JOIN users u ON cs.user_id = u.id WHERE cs.id = $1',
      [submissionId]
    )

    if (submission.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    const sub = submission.rows[0]

    // Check if content is public
    if (sub.status === 'approved' && sub.visibility === 'public') {
      // Public content - return the URL
      return res.json({
        url: sub.private_video_link,
        thumbnail: sub.thumbnail_url,
        isPublic: true
      })
    }

    // Private content - check if user is the creator or admin
    if (userId && (sub.user_id === userId || sub.username === userId)) {
      // Creator can access their own content
      return res.json({
        url: sub.private_video_link,
        thumbnail: sub.thumbnail_url,
        isPublic: false,
        isOwner: true
      })
    }

    // Check if user is admin (you would implement proper admin check here)
    // For now, we'll deny access to private content for non-owners
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'This content is private and not yet approved for public viewing' 
    })

  } catch (error) {
    console.error('Secure content API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
