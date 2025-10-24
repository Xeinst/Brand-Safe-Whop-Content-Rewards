#!/usr/bin/env node

// Database setup script for Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🔧 Setting up database schema...')
  
  try {
    // Read the schema file
    const schema = fs.readFileSync('./database_schema.sql', 'utf8')
    console.log('📄 Schema file loaded')

    // Execute the schema using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Database setup failed:', error.message)
      process.exit(1)
    }

    console.log('✅ Database schema created successfully')

    // Verify tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (tableError) {
      console.log('⚠️ Could not verify tables (expected in some cases)')
    } else {
      console.log('📋 Tables created:')
      tables.forEach(table => console.log(`  - ${table.table_name}`))
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()
