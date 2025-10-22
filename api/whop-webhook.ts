// Whop webhook handler for real-time updates
import { query } from './database'

export default async function handler(req: any, res: any) {
  const { method } = req

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    // Verify webhook signature (in production)
    const signature = req.headers['whop-signature']
    if (!verifyWebhookSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Handle different webhook events
    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'user.deleted':
        await handleUserDeleted(data)
        break
      case 'company.updated':
        await handleCompanyUpdated(data)
        break
      case 'member.joined':
        await handleMemberJoined(data)
        break
      case 'member.left':
        await handleMemberLeft(data)
        break
      default:
        console.log(`Unhandled webhook event: ${type}`)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  // In production, verify the webhook signature using Whop's webhook secret
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn('WHOP_WEBHOOK_SECRET not configured')
    return true // Allow in development
  }

  // Implement proper signature verification
  // This would use crypto to verify the HMAC signature
  return true // Simplified for now
}

async function handleUserCreated(data: any) {
  const { id, username, email, display_name, avatar_url, role, permissions } = data
  
  await query(
    'INSERT INTO users (whop_user_id, username, email, display_name, avatar_url, role, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (whop_user_id) DO UPDATE SET username = $2, email = $3, display_name = $4, avatar_url = $5, role = $6, permissions = $7, updated_at = NOW()',
    [id, username, email, display_name, avatar_url, role, JSON.stringify(permissions || [])]
  )
  
  console.log(`User created/updated: ${username}`)
}

async function handleUserUpdated(data: any) {
  const { id, username, email, display_name, avatar_url, role, permissions } = data
  
  await query(
    'UPDATE users SET username = $2, email = $3, display_name = $4, avatar_url = $5, role = $6, permissions = $7, updated_at = NOW() WHERE whop_user_id = $1',
    [id, username, email, display_name, avatar_url, role, JSON.stringify(permissions || [])]
  )
  
  console.log(`User updated: ${username}`)
}

async function handleUserDeleted(data: any) {
  const { id } = data
  
  await query('DELETE FROM users WHERE whop_user_id = $1', [id])
  
  console.log(`User deleted: ${id}`)
}

async function handleCompanyUpdated(data: any) {
  const { id, name, description, logo_url } = data
  
  await query(
    'UPDATE companies SET name = $2, description = $3, logo_url = $4, updated_at = NOW() WHERE whop_company_id = $1',
    [id, name, description, logo_url]
  )
  
  console.log(`Company updated: ${name}`)
}

async function handleMemberJoined(data: any) {
  const { user_id, company_id } = data
  
  // Update user role to member
  await query(
    'UPDATE users SET role = $2, updated_at = NOW() WHERE whop_user_id = $1',
    [user_id, 'member']
  )
  
  console.log(`Member joined: ${user_id}`)
}

async function handleMemberLeft(data: any) {
  const { user_id, company_id } = data
  
  // Update user role or handle member leaving
  await query(
    'UPDATE users SET role = $2, updated_at = NOW() WHERE whop_user_id = $1',
    [user_id, 'member']
  )
  
  console.log(`Member left: ${user_id}`)
}
