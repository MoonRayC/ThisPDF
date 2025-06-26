const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ migrations table verified');
  } finally {
    client.release();
  }
}

async function getExecutedMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT version FROM migrations ORDER BY version');
    return result.rows.map(r => r.version);
  } finally {
    client.release();
  }
}

async function executeMigration(migration) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`🚧 Running migration: ${migration.version} - ${migration.name}`);
    await client.query(migration.up);
    await client.query(
      'INSERT INTO migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    );
    await client.query('COMMIT');
    console.log(`✅ Migration ${migration.version} done`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Migration ${migration.version} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

function loadMigrations() {
  const dir = path.join(__dirname, '../migrations');
  const files = fs
    .readdirSync(dir)
    .filter(f => /^\d+_.+\.migration\.js$/.test(f))
    .sort();

  return files.map(file => require(path.join(dir, file)));
}

module.exports = {
  createMigrationsTable,
  getExecutedMigrations,
  executeMigration,
  loadMigrations,
};
