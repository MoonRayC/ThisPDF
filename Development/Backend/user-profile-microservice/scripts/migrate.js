const MigrationUtil = require('../src/utils/migration.util');
const pool = require('../src/config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting migration process...');
    
    await MigrationUtil.createMigrationsTable();
    
    const allMigrations = MigrationUtil.getMigrationFiles();
    console.log(`📁 Found ${allMigrations.length} migration files`);
    
    const executedMigrations = await MigrationUtil.getExecutedMigrations();
    console.log(`✅ ${executedMigrations.length} migrations already executed`);
    
    const pendingMigrations = MigrationUtil.getPendingMigrations(allMigrations, executedMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`⏳ ${pendingMigrations.length} pending migrations to execute`);
    
    for (const migration of pendingMigrations) {
      console.log(`⬆️  Executing migration: ${migration}`);
      await MigrationUtil.executeMigration(migration, 'up');
      await MigrationUtil.recordMigration(migration);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

const rollbackMigration = async () => {
  try {
    console.log('🔄 Starting rollback process...');
    
    const executedMigrations = await MigrationUtil.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }
    
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    
    console.log(`⬇️  Rolling back migration: ${lastMigration}`);
    await MigrationUtil.executeMigration(lastMigration, 'down');
    await MigrationUtil.removeMigrationRecord(lastMigration);
    
    console.log('🎉 Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
};

const freshMigration = async () => {
  try {
    console.log('🔄 Starting fresh migration (WARNING: This will drop all data)...');
    
    const executedMigrations = await MigrationUtil.getExecutedMigrations();
    const reversedMigrations = [...executedMigrations].reverse();
    
    for (const migration of reversedMigrations) {
      console.log(`⬇️  Rolling back migration: ${migration}`);
      await MigrationUtil.executeMigration(migration, 'down');
      await MigrationUtil.removeMigrationRecord(migration);
    }
    
    await runMigrations();
    
    console.log('🎉 Fresh migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Fresh migration failed:', error);
    process.exit(1);
  }
};

const command = process.argv[2];

const main = async () => {
  try {
    switch (command) {
      case 'rollback':
        await rollbackMigration();
        break;
      case 'fresh':
        await freshMigration();
        break;
      default:
        await runMigrations();
        break;
    }
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();