// Database initialization script
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('Initializing database...')
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('Database schema created successfully')
    
    // Insert sample data
    const sampleData = `
      -- Insert sample companies
      INSERT INTO companies (whop_company_id, name, description) VALUES 
      ('whop-company-1', 'Demo Brand Community', 'A sample community for testing brand-safe content approval')
      ON CONFLICT (whop_company_id) DO NOTHING;

      -- Insert sample users
      INSERT INTO users (whop_user_id, username, email, display_name, role, permissions) VALUES 
      ('whop-user-1', 'demo_owner', 'owner@example.com', 'Demo Owner', 'owner', 
       ARRAY['read_content', 'write_content', 'read_analytics', 'member:stats:export', 'admin']),
      ('whop-user-2', 'demo_member', 'member@example.com', 'Demo Member', 'member',
       ARRAY['read_content', 'write_content', 'read_analytics'])
      ON CONFLICT (whop_user_id) DO NOTHING;

      -- Insert sample content rewards
      INSERT INTO content_rewards (company_id, name, description, cpm, created_by) VALUES 
      ((SELECT id FROM companies WHERE whop_company_id = 'whop-company-1'),
       'Make videos different coaching businesses you can start',
       'Create content about coaching business opportunities',
       4.00,
       (SELECT id FROM users WHERE whop_user_id = 'whop-user-1'))
      ON CONFLICT DO NOTHING;

      -- Insert sample submissions
      INSERT INTO content_submissions (user_id, content_reward_id, title, description, private_video_link, thumbnail_url, platform, status, views, likes) VALUES 
      ((SELECT id FROM users WHERE whop_user_id = 'whop-user-2'),
       (SELECT id FROM content_rewards WHERE name = 'Make videos different coaching businesses you can start'),
       'How to Start a Life Coaching Business',
       'A comprehensive guide to starting your own life coaching business',
       'https://youtube.com/watch?v=sample1',
       'https://img.youtube.com/vi/sample1/maxresdefault.jpg',
       'youtube',
       'pending_approval',
       0,
       0),
      ((SELECT id FROM users WHERE whop_user_id = 'whop-user-2'),
       (SELECT id FROM content_rewards WHERE name = 'Make videos different coaching businesses you can start'),
       'Business Coaching for Entrepreneurs',
       'Tips and strategies for business coaching',
       'https://youtube.com/watch?v=sample2',
       'https://img.youtube.com/vi/sample2/maxresdefault.jpg',
       'youtube',
       'approved',
       1500,
       45)
      ON CONFLICT DO NOTHING;
    `
    
    await pool.query(sampleData)
    console.log('Sample data inserted successfully')
    
    console.log('Database initialization completed!')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  initDatabase().catch(console.error)
}

module.exports = { initDatabase }
