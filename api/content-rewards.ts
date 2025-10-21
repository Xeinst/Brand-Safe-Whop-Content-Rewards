// API route for content rewards operations
import { query } from './database'

export default async function handler(req: any, res: any) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return await handleGetContentRewards(req, res)
      case 'POST':
        return await handleCreateContentReward(req, res)
      case 'PUT':
        return await handleUpdateContentReward(req, res)
      case 'DELETE':
        return await handleDeleteContentReward(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Content Rewards API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetContentRewards(req: any, res: any) {
  const { company_id } = req.query

  if (!company_id) {
    return res.status(400).json({ error: 'Missing company_id parameter' })
  }

  const result = await query(
    'SELECT * FROM content_rewards WHERE company_id = $1 ORDER BY created_at DESC',
    [company_id]
  )

  return res.json(result.rows)
}

async function handleCreateContentReward(req: any, res: any) {
  const { company_id, name, description, cpm, created_by } = req.body

  if (!company_id || !name || !cpm || !created_by) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const result = await query(
    'INSERT INTO content_rewards (company_id, name, description, cpm, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [company_id, name, description, cpm, created_by]
  )

  return res.status(201).json(result.rows[0])
}

async function handleUpdateContentReward(req: any, res: any) {
  const { id } = req.query
  const updates = req.body

  if (!id) {
    return res.status(400).json({ error: 'Missing content reward id' })
  }

  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
  const values = Object.values(updates)

  const result = await query(
    `UPDATE content_rewards SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Content reward not found' })
  }

  return res.json(result.rows[0])
}

async function handleDeleteContentReward(req: any, res: any) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Missing content reward id' })
  }

  const result = await query('DELETE FROM content_rewards WHERE id = $1 RETURNING *', [id])

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Content reward not found' })
  }

  return res.json({ message: 'Content reward deleted successfully' })
}
