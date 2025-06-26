require('dotenv').config();
const { pool } = require('../src/config/database');
const {
  createMigrationsTable,
  getExecutedMigrations,
  loadMigrations
} = require('../src/utils/migration.util');
const { spawnSync } = require('child_process');

async function rollback() {
  const executed = await getExecutedMigrations();
  if (!executed.length) {
    console.log('Nothing to rollback');
    return;
  }
  const latestVersion = Math.max(...executed);
  const migrations = loadMigrations();
  const latest = migrations.find(m => m.version === latestVersion);
  if (!latest) {
    console.error('Latest migration file not found');
    process.exit(1);
  }

  console.log(`Rolling back migration ${latest.version}: ${latest.name}`);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(latest.down);
    await client.query('DELETE FROM migrations WHERE version = $1', [latest.version]);
    await client.query('COMMIT');
    console.log(`✅ Rolled back version ${latest.version}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rollback failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function refresh() {
  console.log('🔥 Refreshing database...');
  const executed = await getExecutedMigrations();
  const migrations = loadMigrations().sort((a, b) => b.version - a.version);
  for (const mig of migrations) {
    if (executed.includes(mig.version)) {
      console.log(`Rolling back ${mig.version}`);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(mig.down);
        await client.query('DELETE FROM migrations WHERE version = $1', [mig.version]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during refresh rollback:', err);
        process.exit(1);
      } finally {
        client.release();
      }
    }
  }

  console.log('✅ Rollback complete. Re-running all migrations...');
  process.exit(spawnSync('node', ['scripts/run-migrations.js'], { stdio: 'inherit' }).status);
}

async function run() {
  const arg = process.argv[2];
  await createMigrationsTable();

  if (arg === '--rollback') return rollback();
  if (arg === '--refresh') return refresh();

  console.log('Usage:');
  console.log('  migrate.js --rollback    # undo latest migration');
  console.log('  migrate.js --refresh     # rollback all and re-run migrations');
}

if (require.main === module) {
  pool
    .connect()
    .then(() => run().then(() => pool.end()))
    .catch(err => {
      console.error(err);
      pool.end();
    });
}
