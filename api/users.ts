// API route for user operations
import { VercelRequest, VercelResponse } from '@vercel/node'
import { query } from './database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetUser(req, res)
      case 'POST':
        return await handleCreateUser(req, res)
      case 'PUT':
        return await handleUpdateUser(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('User API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetUser(req: any, res: any) {
  const { id, whop_user_id } = req.query

  if (whop_user_id) {
    const result = await query('SELECT * FROM users WHERE whop_user_id = $1', [whop_user_id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json(result.rows[0])
  }

  if (id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json(result.rows[0])
  }

  return res.status(400).json({ error: 'Missing id or whop_user_id parameter' })
}

async function handleCreateUser(req: any, res: any) {
  const { whop_user_id, username, email, display_name, avatar_url, role, permissions } = req.body

  if (!whop_user_id || !username || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const result = await query(
    'INSERT INTO users (whop_user_id, username, email, display_name, avatar_url, role, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [whop_user_id, username, email, display_name, avatar_url, role, JSON.stringify(permissions || [])]
  )

  return res.status(201).json(result.rows[0])
}

async function handleUpdateUser(req: any, res: any) {
  const { id } = req.query
  const updates = req.body

  if (!id) {
    return res.status(400).json({ error: 'Missing user id' })
  }

  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
  const values = Object.values(updates)

  const result = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json(result.rows[0])
}
