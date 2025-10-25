const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import database config
const { query, pool } = require('../src/config/database');

const migrationsDir = path.join(__dirname, '../src/migrations');

async function rollbackLastMigration() {
  try {
    console.log('🔄 Rolling back last migration...');

    // Get the last executed migration
    const result = await query(
      'SELECT filename FROM migration_history ORDER BY executed_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.log('📝 No migrations to rollback');
      return;
    }

    const lastMigration = result.rows[0].filename;
    console.log(`🔄 Rolling back migration: ${lastMigration}`);

    const migrationPath = path.join(migrationsDir, lastMigration);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${lastMigration}`);
      return;
    }

    const migration = require(migrationPath);

    // Execute the rollback
    await migration.down();
    
    // Remove from migration history
    await query(
      'DELETE FROM migration_history WHERE filename = $1',
      [lastMigration]
    );

    console.log(`✅ Migration ${lastMigration} rolled back successfully`);

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function refreshDatabase() {
  try {
    console.log('🔄 Refreshing database (rollback all + migrate)...');

    const result = await query(
      'SELECT filename FROM migration_history ORDER BY executed_at DESC'
    );

    // Rollback all migrations
    for (const row of result.rows) {
      const filename = row.filename;
      console.log(`🔄 Rolling back migration: ${filename}`);
      
      const migrationPath = path.join(migrationsDir, filename);
      
      if (fs.existsSync(migrationPath)) {
        const migration = require(migrationPath);
        await migration.down();
      }
    }

    // Clear migration history
    await query('DELETE FROM migration_history');
    console.log('🧹 Cleared migration history');

    // Run all migrations again
    const { runMigrations } = require('./run-migrations');
    await runMigrations();

  } catch (error) {
    console.error('❌ Database refresh failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'rollback':
    rollbackLastMigration();
    break;
  case 'refresh':
    refreshDatabase();
    break;
  default:
    console.log(`
Usage: node scripts/migrate.js <command>

Commands:
  rollback  - Rollback the last executed migration
  refresh   - Rollback all migrations and run them again

Examples:
  npm run migrate:rollback
  npm run migrate:refresh
    `);
    process.exit(1);
}