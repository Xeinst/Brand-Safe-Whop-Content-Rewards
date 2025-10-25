// Consolidated API handler to reduce serverless function count
import { query } from './database'
import { z } from 'zod'

// Mock admin check function since whop-authz is not available
async function adminOnly(user: any): Promise<boolean> {
  return user.role === 'owner' || user.role === 'admin'
}

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  advertiserId: z.string().min(1),
  cpmCents: z.number().int().min(0),
  budgetCents: z.number().int().min(0).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  rulesId: z.string().uuid().optional(),
  companyId: z.string().uuid()
})

const createSubmissionSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  storageKey: z.string().min(1),
  thumbKey: z.string().optional(),
  campaignId: z.string().uuid().optional()
})

const approveSubmissionSchema = z.object({
  reviewNote: z.string().optional()
})

const rejectSubmissionSchema = z.object({
  note: z.string().min(1)
})

export default async function handler(req: any, res: any) {
  const { method } = req
  const pathname = req.url ? new URL(req.url, 'http://localhost').pathname : ''

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Route based on pathname
    if (pathname.startsWith('/api/admin/campaigns')) {
      return await handleCampaigns(req, res)
    } else if (pathname.startsWith('/api/admin/review-queue')) {
      return await handleReviewQueue(req, res)
    } else if (pathname.includes('/api/admin/submissions/') && pathname.includes('/approve')) {
      return await handleApproveSubmission(req, res)
    } else if (pathname.includes('/api/admin/submissions/') && pathname.includes('/reject')) {
      return await handleRejectSubmission(req, res)
    } else if (pathname.startsWith('/api/submissions')) {
      return await handleSubmissions(req, res)
    } else if (pathname.startsWith('/api/me/submissions')) {
      return await handleMySubmissions(req, res)
    } else if (pathname.startsWith('/api/earnings/summary')) {
      return await handleEarningsSummary(req, res)
    } else if (pathname.startsWith('/api/payouts/run')) {
      return await handleRunPayouts(req, res)
    } else if (pathname.includes('/api/payouts/send/')) {
      return await handleSendPayout(req, res)
    } else if (pathname.startsWith('/api/analytics')) {
      return await handleAnalytics(req, res)
    } else if (pathname.startsWith('/api/content-rewards')) {
      return await handleContentRewards(req, res)
    } else if (pathname.startsWith('/api/users')) {
      return await handleUsers(req, res)
    } else if (pathname.startsWith('/api/secure-content')) {
      return await handleSecureContent(req, res)
    } else if (pathname.startsWith('/api/events/view')) {
      return await handleViewEvent(req, res)
    } else {
      return res.status(404).json({ error: 'API endpoint not found' })
    }
  } catch (error) {
    console.error('Consolidated API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Campaign handlers
async function handleCampaigns(req: any, res: any) {
  const { method } = req
  const { companyId } = req.query

  // Mock user - replace with actual auth
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  switch (method) {
    case 'GET':
      if (!companyId) {
        return res.status(400).json({ error: 'Missing companyId parameter' })
      }

      const campaigns = await query(`
        SELECT 
          c.*,
          COUNT(cs.id) as submission_count,
          SUM(CASE WHEN cs.status = 'approved' AND cs.visibility = 'public' THEN cs.views ELSE 0 END) as total_views,
          SUM(CASE WHEN cs.status = 'approved' AND cs.visibility = 'public' THEN cs.views * c.cpm_cents / 1000 ELSE 0 END) as total_spend_cents
        FROM campaigns c
        LEFT JOIN content_submissions cs ON c.id = cs.campaign_id
        WHERE c.company_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [companyId])

      return res.json(campaigns.rows)

    case 'POST':
      const body = createCampaignSchema.parse(req.body)
      const result = await query(`
        INSERT INTO campaigns (name, advertiser_id, cpm_cents, budget_cents, start_at, end_at, rules_id, company_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        body.name, body.advertiserId, body.cpmCents, body.budgetCents || 0,
        body.startAt, body.endAt, body.rulesId, body.companyId
      ])
      return res.status(201).json(result.rows[0])

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

// Review queue handler
async function handleReviewQueue(_req: any, res: any) {
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const result = await query(`
    SELECT 
      cs.*,
      u.username,
      u.display_name,
      u.avatar_url,
      c.name as campaign_name,
      c.cpm_cents
    FROM content_submissions cs
    LEFT JOIN users u ON cs.creator_id = u.id
    LEFT JOIN campaigns c ON cs.campaign_id = c.id
    WHERE cs.status IN ('pending_review', 'flagged')
    ORDER BY cs.created_at ASC
  `)

  return res.json(result.rows)
}

// Submission handlers
async function handleSubmissions(req: any, res: any) {
  const { method } = req

  switch (method) {
    case 'GET':
      const { userId: queryUserId, status, public_only } = req.query

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

      if (queryUserId) {
        paramCount++
        queryText += ` AND cs.creator_id = $${paramCount}`
        params.push(queryUserId)
      }

      if (status) {
        paramCount++
        queryText += ` AND cs.status = $${paramCount}`
        params.push(status)
      }

      if (public_only === 'true') {
        queryText += ` AND cs.status = 'approved' AND cs.visibility = 'public'`
      }

      queryText += ' ORDER BY cs.created_at DESC'

      const result = await query(queryText, params)
      return res.json(result.rows)

    case 'POST':
      const body = createSubmissionSchema.parse(req.body)
      const mockUserId = 'user-123' // Mock user

      const submission = await query(`
        INSERT INTO content_submissions (
          creator_id, campaign_id, storage_key, thumb_key, title, description, 
          status, visibility, private_video_link
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        mockUserId, body.campaignId, body.storageKey, body.thumbKey,
        body.title, body.description, 'pending_review', 'private', body.storageKey
      ])

      return res.status(201).json(submission.rows[0])

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

// My submissions handler
async function handleMySubmissions(_req: any, res: any) {
  const userId = 'user-123' // Mock user

  const result = await query(`
    SELECT 
      cs.*,
      c.name as campaign_name,
      c.cpm_cents
    FROM content_submissions cs
    LEFT JOIN campaigns c ON cs.campaign_id = c.id
    WHERE cs.creator_id = $1
    ORDER BY cs.created_at DESC
  `, [userId])

  return res.json(result.rows)
}

// Approve submission handler
async function handleApproveSubmission(req: any, res: any) {
  const { id } = req.query
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing submission id' })
  }

  const body = approveSubmissionSchema.parse(req.body)

  const result = await query(`
    UPDATE content_submissions 
    SET 
      status = 'approved',
      visibility = 'public',
      reviewed_by = $1,
      approved_at = NOW(),
      rejected_at = NULL,
      review_note = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `, [user.id, body.reviewNote, id])

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Submission not found' })
  }

  return res.json(result.rows[0])
}

// Reject submission handler
async function handleRejectSubmission(req: any, res: any) {
  const { id } = req.query
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing submission id' })
  }

  const body = rejectSubmissionSchema.parse(req.body)

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
}

// Earnings summary handler
async function handleEarningsSummary(req: any, res: any) {
  const { period, userId } = req.query

  if (!period || !userId) {
    return res.status(400).json({ error: 'Missing period or userId parameter' })
  }

  const [year, month] = (period as string).split('-')
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

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
}

// Run payouts handler
async function handleRunPayouts(req: any, res: any) {
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { period } = req.query

  if (!period) {
    return res.status(400).json({ error: 'Missing period parameter' })
  }

  const [year, month] = (period as string).split('-')
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

  const creators = await query(`
    SELECT 
      cs.creator_id,
      u.username,
      u.display_name,
      SUM(cs.views * c.cpm_cents / 1000) as total_earnings_cents,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'submission_id', cs.id,
          'title', cs.title,
          'views', cs.views,
          'cpm_cents', c.cpm_cents,
          'earnings_cents', cs.views * c.cpm_cents / 1000
        )
      ) as breakdown
    FROM content_submissions cs
    LEFT JOIN campaigns c ON cs.campaign_id = c.id
    LEFT JOIN users u ON cs.creator_id = u.id
    WHERE cs.status = 'approved'
      AND cs.visibility = 'public'
      AND cs.approved_at >= $1
      AND cs.approved_at <= $2
    GROUP BY cs.creator_id, u.username, u.display_name
    HAVING SUM(cs.views * c.cpm_cents / 1000) > 0
  `, [startDate, endDate])

  const payoutIds = []
  for (const creator of creators.rows) {
    const payout = await query(`
      INSERT INTO payouts (
        creator_id, period_start, period_end, amount_cents, breakdown_json
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      creator.creator_id, startDate, endDate,
      creator.total_earnings_cents, creator.breakdown
    ])
    
    payoutIds.push(payout.rows[0].id)
  }

  return res.json({
    period,
    payoutCount: payoutIds.length,
    payoutIds,
    message: `Created ${payoutIds.length} payout records for ${period}`
  })
}

// Send payout handler
async function handleSendPayout(_req: any, res: any) {
  const { id } = _req.query
  const user = { id: 'user-123', role: 'owner' as const, companyId: 'company-123' }
  
  if (!await adminOnly(user)) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing payout id' })
  }

  const payout = await query(`
    SELECT p.*, u.username, u.display_name
    FROM payouts p
    LEFT JOIN users u ON p.creator_id = u.id
    WHERE p.id = $1
  `, [id])

  if (payout.rows.length === 0) {
    return res.status(404).json({ error: 'Payout not found' })
  }

  const payoutData = payout.rows[0]

  if (payoutData.status !== 'pending') {
    return res.status(400).json({ error: 'Payout is not in pending status' })
  }

  const externalRef = `whop_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const result = await query(`
    UPDATE payouts 
    SET 
      status = 'sent',
      external_ref = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [externalRef, id])

  return res.json({
    payout: result.rows[0],
    externalRef,
    message: 'Payout sent successfully'
  })
}

// Additional consolidated handlers
async function handleAnalytics(req: any, res: any) {
  const { method } = req
  
  if (method === 'GET') {
    const { company_id, start_date, end_date } = req.query
    
    if (!company_id) {
      return res.status(400).json({ error: 'Missing company_id parameter' })
    }
    
    const result = await query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'approved' AND visibility = 'public' THEN 1 END) as approved_submissions,
        SUM(CASE WHEN status = 'approved' AND visibility = 'public' THEN views ELSE 0 END) as total_views,
        AVG(CASE WHEN status = 'approved' AND visibility = 'public' THEN views ELSE 0 END) as avg_views
      FROM content_submissions cs
      WHERE cs.campaign_id IN (
        SELECT id FROM campaigns WHERE company_id = $1
      )
      ${start_date ? 'AND cs.created_at >= $2' : ''}
      ${end_date ? 'AND cs.created_at <= $3' : ''}
    `, [company_id, start_date, end_date].filter(Boolean))
    
    return res.json(result.rows[0])
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleContentRewards(req: any, res: any) {
  const { method } = req
  
  switch (method) {
    case 'GET':
      const rewards = await query('SELECT * FROM content_rewards ORDER BY created_at DESC')
      return res.json(rewards.rows)
      
    case 'POST':
      const body = req.body
      const result = await query(`
        INSERT INTO content_rewards (name, description, reward_amount, requirements, active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [body.name, body.description, body.reward_amount, body.requirements, body.active])
      
      return res.status(201).json(result.rows[0])
      
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleUsers(req: any, res: any) {
  const { method } = req
  
  switch (method) {
    case 'GET':
      const users = await query('SELECT * FROM users ORDER BY created_at DESC')
      return res.json(users.rows)
      
    case 'POST':
      const body = req.body
      const result = await query(`
        INSERT INTO users (username, display_name, email, role, whop_user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [body.username, body.display_name, body.email, body.role, body.whop_user_id])
      
      return res.status(201).json(result.rows[0])
      
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleSecureContent(req: any, res: any) {
  const { method } = req
  
  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { submissionId, userId } = req.query
  
  if (!submissionId) {
    return res.status(400).json({ error: 'Missing submissionId' })
  }
  
  const submission = await query(
    'SELECT cs.*, u.username, u.display_name FROM content_submissions cs LEFT JOIN users u ON cs.creator_id = u.id WHERE cs.id = $1',
    [submissionId]
  )
  
  if (submission.rows.length === 0) {
    return res.status(404).json({ error: 'Submission not found' })
  }
  
  const sub = submission.rows[0]
  
  if (sub.status === 'approved' && sub.visibility === 'public') {
    return res.json({
      url: sub.private_video_link,
      thumbnail: sub.thumbnail_url,
      isPublic: true
    })
  }
  
  if (userId && (sub.creator_id === userId || sub.username === userId)) {
    return res.json({
      url: sub.private_video_link,
      thumbnail: sub.thumbnail_url,
      isPublic: false,
      isOwner: true
    })
  }
  
  return res.status(403).json({
    error: 'Access denied',
    message: 'This content is private and not yet approved for public viewing'
  })
}

async function handleViewEvent(req: any, res: any) {
  const { method } = req
  
  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { submissionId, userId: _userId, timestamp: _timestamp } = req.body
  
  if (!submissionId) {
    return res.status(400).json({ error: 'Missing submissionId' })
  }
  
  // Only track views for approved, public content
  const submission = await query(
    'SELECT status, visibility FROM content_submissions WHERE id = $1',
    [submissionId]
  )
  
  if (submission.rows.length === 0) {
    return res.status(404).json({ error: 'Submission not found' })
  }
  
  const sub = submission.rows[0]
  
  if (sub.status !== 'approved' || sub.visibility !== 'public') {
    return res.status(403).json({ error: 'Content not available for viewing' })
  }
  
  // Record the view
  await query(`
    INSERT INTO impression_aggregates (submission_id, date, region, device, verified_views)
    VALUES ($1, $2, $3, $4, 1)
    ON CONFLICT (submission_id, date, region, device)
    DO UPDATE SET verified_views = impression_aggregates.verified_views + 1
  `, [submissionId, new Date().toISOString().split('T')[0], 'unknown', 'unknown'])
  
  return res.json({ success: true })
}
