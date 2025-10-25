// Database connection utility for Supabase
import { Pool } from 'pg'

let pool: Pool | null = null

export function getDatabase() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
    
    if (!connectionString) {
      console.warn('DATABASE_URL or POSTGRES_URL environment variable is not set, using mock database')
      // Return a mock pool for development
      return createMockPool()
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Always use SSL for Supabase
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

// Mock database for development when no real database is available
function createMockPool() {
  return {
    query: async (text: string, params?: any[]) => {
      console.log('Mock database query:', text, params)
      // Return mock data based on query
      if (text.includes('SELECT') && text.includes('campaigns')) {
        return {
          rows: [
            {
              id: 'campaign-1',
              name: 'Brand Safe Content',
              description: 'Submit brand-safe content for approval',
              status: 'active',
              cpm_cents: 250,
              created_at: new Date(),
              updated_at: new Date()
            }
          ],
          rowCount: 1
        }
      }
      if (text.includes('SELECT') && text.includes('content_submissions')) {
        return {
          rows: [
            {
              id: 'submission-1',
              title: 'Sample Submission',
              description: 'A sample content submission',
              status: 'pending_review',
              creator_id: 'user-123',
              created_at: new Date()
            }
          ],
          rowCount: 1
        }
      }
      if (text.includes('INSERT')) {
        return {
          rows: [{ id: 'new-id', ...params }],
          rowCount: 1
        }
      }
      if (text.includes('UPDATE')) {
        return {
          rows: [{ id: params?.[0] || 'updated-id' }],
          rowCount: 1
        }
      }
      return { rows: [], rowCount: 0 }
    }
  }
}

export async function query(text: string, params?: any[]) {
  const db = getDatabase()
  const start = Date.now()
  try {
    const res = await db.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
