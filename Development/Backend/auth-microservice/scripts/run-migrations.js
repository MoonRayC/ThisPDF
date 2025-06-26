require('dotenv').config();
const { pool } = require('../src/config/database');
const {
  createMigrationsTable,
  getExecutedMigrations,
  executeMigration,
  loadMigrations
} = require('../src/utils/migration.util');

async function runMigrations() {
  try {
    console.log('🚀 Starting migrations...');
    await createMigrationsTable();

    const executed = await getExecutedMigrations();
    const migrations = loadMigrations();
    const pending = migrations.filter(m => !executed.includes(m.version));

    if (!pending.length) {
      console.log('✅ No pending migrations');
      return;
    }

    for (const migration of pending) {
      await executeMigration(migration);
    }

    console.log('🎉 All migrations completed');
  } catch (err) {
    console.error('💥 Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}
