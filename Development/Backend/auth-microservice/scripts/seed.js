require('dotenv').config();
const { pool } = require('../src/config/database');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');
    await client.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [
      'admin@example.com',
      '@hashed_password_here'
    ]);
    console.log('✅ Seed data inserted');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
