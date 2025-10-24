#!/usr/bin/env node

// Database setup script for Supabase
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function setupDatabase() {
  console.log('🔧 Setting up database schema...');
  
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');

    // Read the schema file
    const schema = fs.readFileSync('./database_schema.sql', 'utf8');
    console.log('📄 Schema file loaded');

    // Execute the schema
    await client.query(schema);
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
