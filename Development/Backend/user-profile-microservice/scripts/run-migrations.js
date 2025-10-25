const MigrationUtil = require('../src/utils/migration.util');
const pool = require('../src/config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    

    await MigrationUtil.createMigrationsTable();
    

    const allMigrations = MigrationUtil.getMigrationFiles();
    
    if (allMigrations.length === 0) {
      console.log('📁 No migration files found');
      return;
    }
    
    console.log(`📁 Found ${allMigrations.length} migration files`);
    
    // Get executed migrations
    const executedMigrations = await MigrationUtil.getExecutedMigrations();
    console.log(`✅ ${executedMigrations.length} migrations already executed`);
    
    // Get pending migrations
    const pendingMigrations = MigrationUtil.getPendingMigrations(allMigrations, executedMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date - no pending migrations');
      return;
    }
    
    console.log(`⏳ Executing ${pendingMigrations.length} pending migrations...`);
    
    // Execute pending migrations in order
    for (const migration of pendingMigrations) {
      try {
        console.log(`⬆️  Executing: ${migration}`);
        await MigrationUtil.executeMigration(migration, 'up');
        await MigrationUtil.recordMigration(migration);
        console.log(`✅ Completed: ${migration}`);
      } catch (error) {
        console.error(`❌ Failed to execute migration ${migration}:`, error);
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    console.error('💡 You may need to manually fix the database and retry');
    process.exit(1);
  }
};


const main = async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  } finally {
  
    await pool.end();
    console.log('🔌 Database connection closed');
  }
};


if (require.main === module) {
  main();
}

module.exports = { runMigrations };