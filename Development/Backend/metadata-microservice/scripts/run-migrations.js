const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import database config
const { query, pool } = require('../src/config/database');

const migrationsDir = path.join(__dirname, '../src/migrations');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('📝 No migration files found');
      return;
    }

    // Get already executed migrations
    const executedResult = await query(
      'SELECT filename FROM migration_history ORDER BY executed_at'
    );
    const executedMigrations = executedResult.rows.map(row => row.filename);

    // Run pending migrations
    let migrationsRun = 0;
    
    for (const filename of migrationFiles) {
      if (executedMigrations.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${filename}`);
      
      const migrationPath = path.join(migrationsDir, filename);
      const migration = require(migrationPath);

      // Execute the migration
      await migration.up();
      
      // Record the migration as executed
      await query(
        'INSERT INTO migration_history (filename) VALUES ($1)',
        [filename]
      );

      console.log(`✅ Migration ${filename} completed successfully`);
      migrationsRun++;
    }

    if (migrationsRun === 0) {
      console.log('📝 All migrations are up to date');
    } else {
      console.log(`🎉 Successfully ran ${migrationsRun} migration(s)`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };