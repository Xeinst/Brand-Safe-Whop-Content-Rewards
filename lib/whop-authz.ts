import { query } from '../api/database'

export interface User {
  id: string
  role: 'admin' | 'owner' | 'member'
  companyId?: string
  whopUserId?: string
}

export interface Company {
  id: string
  whopCompanyId: string
  name: string
}

export interface Experience {
  id: string
  whopExperienceId: string
  companyId: string
  name: string
  active: boolean
}

/**
 * Check if user can access dashboard for a specific company
 */
export async function canAccessDashboard(user: User, companyId: string): Promise<boolean> {
  try {
    // Admin users can access any dashboard
    if (user.role === 'admin') {
      return true
    }
    
    // Owner users can only access their own company dashboard
    if (user.role === 'owner') {
      // Check if user's company matches the requested company
      const company = await query(
        'SELECT id FROM companies WHERE id = $1 AND whop_company_id = $2',
        [companyId, user.companyId]
      )
      
      return company.rows.length > 0
    }
    
    // Members cannot access dashboards
    return false
  } catch (error) {
    console.error('Error checking dashboard access:', error)
    return false
  }
}

/**
 * Check if user can access experience (requires active membership)
 */
export async function canAccessExperience(user: User, experienceId: string): Promise<boolean> {
  try {
    // Check if user has active membership for this experience
    const membership = await query(`
      SELECT 
        m.id,
        m.status,
        m.expires_at,
        e.company_id,
        c.whop_company_id
      FROM memberships m
      JOIN experiences e ON m.experience_id = e.id
      JOIN companies c ON e.company_id = c.id
      WHERE m.user_id = $1 
        AND e.whop_experience_id = $2
        AND m.status = 'active'
        AND (m.expires_at IS NULL OR m.expires_at > NOW())
    `, [user.id, experienceId])
    
    return membership.rows.length > 0
  } catch (error) {
    console.error('Error checking experience access:', error)
    return false
  }
}

/**
 * Check if user is admin or owner
 */
export function isAdminOrOwner(user: User): boolean {
  return user.role === 'admin' || user.role === 'owner'
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin'
}

/**
 * Get user's company ID
 */
export function getUserCompanyId(user: User): string | null {
  return user.companyId || null
}

/**
 * Validate admin access for API routes
 */
export async function adminOnly(user: User): Promise<boolean> {
  return isAdminOrOwner(user)
}

/**
 * Validate company access for API routes
 */
export async function companyAccess(user: User, companyId: string): Promise<boolean> {
  if (isAdmin(user)) {
    return true
  }
  
  if (user.role === 'owner' && user.companyId === companyId) {
    return true
  }
  
  return false
}
