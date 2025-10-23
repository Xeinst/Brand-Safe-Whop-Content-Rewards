// API route for campaign management (admin/owner only)
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from '../database'
import { adminOnly } from '../../lib/whop-authz'
import { z } from 'zod'

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

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  cpmCents: z.number().int().min(0).optional(),
  budgetCents: z.number().int().min(0).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  active: z.boolean().optional(),
  rulesId: z.string().uuid().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Mock user - replace with actual auth
    const user = { id: 'user-123', role: 'owner', companyId: 'company-123' }
    
    if (!await adminOnly(user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    switch (method) {
      case 'GET':
        return await handleGetCampaigns(req, res, user)
      case 'POST':
        return await handleCreateCampaign(req, res, user)
      case 'PATCH':
        return await handleUpdateCampaign(req, res, user)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Campaigns API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetCampaigns(req: VercelRequest, res: VercelResponse, user: any) {
  const { companyId } = req.query

  if (!companyId) {
    return res.status(400).json({ error: 'Missing companyId parameter' })
  }

  // Get campaigns with basic stats
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
}

async function handleCreateCampaign(req: VercelRequest, res: VercelResponse, user: any) {
  const body = createCampaignSchema.parse(req.body)

  const result = await query(`
    INSERT INTO campaigns (name, advertiser_id, cpm_cents, budget_cents, start_at, end_at, rules_id, company_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    body.name,
    body.advertiserId,
    body.cpmCents,
    body.budgetCents || 0,
    body.startAt,
    body.endAt,
    body.rulesId,
    body.companyId
  ])

  return res.status(201).json(result.rows[0])
}

async function handleUpdateCampaign(req: VercelRequest, res: VercelResponse, user: any) {
  const { id } = req.query
  const body = updateCampaignSchema.parse(req.body)

  if (!id) {
    return res.status(400).json({ error: 'Missing campaign id' })
  }

  // Build dynamic update query
  const updates = []
  const values = []
  let paramCount = 0

  if (body.name !== undefined) {
    paramCount++
    updates.push(`name = $${paramCount}`)
    values.push(body.name)
  }
  if (body.cpmCents !== undefined) {
    paramCount++
    updates.push(`cpm_cents = $${paramCount}`)
    values.push(body.cpmCents)
  }
  if (body.budgetCents !== undefined) {
    paramCount++
    updates.push(`budget_cents = $${paramCount}`)
    values.push(body.budgetCents)
  }
  if (body.startAt !== undefined) {
    paramCount++
    updates.push(`start_at = $${paramCount}`)
    values.push(body.startAt)
  }
  if (body.endAt !== undefined) {
    paramCount++
    updates.push(`end_at = $${paramCount}`)
    values.push(body.endAt)
  }
  if (body.active !== undefined) {
    paramCount++
    updates.push(`active = $${paramCount}`)
    values.push(body.active)
  }
  if (body.rulesId !== undefined) {
    paramCount++
    updates.push(`rules_id = $${paramCount}`)
    values.push(body.rulesId)
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }

  paramCount++
  updates.push(`updated_at = NOW()`)
  values.push(id)

  const result = await query(`
    UPDATE campaigns 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values)

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Campaign not found' })
  }

  return res.json(result.rows[0])
}
