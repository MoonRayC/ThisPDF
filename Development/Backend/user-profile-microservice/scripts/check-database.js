const pool = require('../src/config/database');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database connection and structure...\n');
    
    // Test basic connection
    console.log('1. Testing database connection...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('   ✅ Connection successful');
    console.log(`   📅 Current time: ${connectionTest.rows[0].current_time}`);
    console.log(`   🐘 PostgreSQL version: ${connectionTest.rows[0].postgres_version.split(' ')[0]}\n`);
    
    // Check if migrations table exists
    console.log('2. Checking migrations table...');
    const migrationsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (migrationsTableCheck.rows[0].exists) {
      console.log('   ✅ Migrations table exists');
      
      // Get executed migrations
      const executedMigrations = await pool.query('SELECT filename, executed_at FROM migrations ORDER BY id');
      console.log(`   📊 Executed migrations: ${executedMigrations.rows.length}`);
      
      if (executedMigrations.rows.length > 0) {
        executedMigrations.rows.forEach((migration, index) => {
          console.log(`      ${index + 1}. ${migration.filename} (${migration.executed_at})`);
        });
      }
    } else {
      console.log('   ⚠️  Migrations table does not exist');
    }
    console.log('');
    
    // Check if user_profiles table exists
    console.log('3. Checking user_profiles table...');
    const profilesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
      );
    `);
    
    if (profilesTableCheck.rows[0].exists) {
      console.log('   ✅ user_profiles table exists');
      
      // Get table structure
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
        ORDER BY ordinal_position;
      `);
      
      console.log('   📋 Table structure:');
      tableStructure.rows.forEach(column => {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = column.column_default ? ` DEFAULT ${column.column_default}` : '';
        console.log(`      ${column.column_name}: ${column.data_type} ${nullable}${defaultVal}`);
      });
      
      // Get record count
      const recordCount = await pool.query('SELECT COUNT(*) as count FROM user_profiles');
      console.log(`   📊 Total records: ${recordCount.rows[0].count}`);
      
      // Get sample records
      if (parseInt(recordCount.rows[0].count) > 0) {
        const sampleRecords = await pool.query(`
          SELECT username, bio, last_active_at, created_at 
          FROM user_profiles 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        console.log('   📝 Sample records:');
        sampleRecords.rows.forEach((record, index) => {
          console.log(`      ${index + 1}. ${record.username} - ${record.bio ? record.bio.substring(0, 50) + '...' : 'No bio'}`);
        });
      }
      
      // Check indexes
      const indexes = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'user_profiles' AND schemaname = 'public';
      `);
      
      console.log('   🔍 Indexes:');
      indexes.rows.forEach(index => {
        console.log(`      ${index.indexname}`);
      });
      
    } else {
      console.log('   ❌ user_profiles table does not exist');
    }
    console.log('');
    
    // Check database size
    console.log('4. Database statistics...');
    const dbSize = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
    `);
    console.log(`   💾 Database size: ${dbSize.rows[0].database_size}`);
    
    // Check active connections
    const connections = await pool.query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `);
    console.log(`   🔗 Active connections: ${connections.rows[0].active_connections}`);
    
    console.log('\n🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure PostgreSQL is running and connection details are correct');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Create it first or check DB_NAME in .env');
    } else if (error.code === '28P01') {
      console.error('💡 Authentication failed. Check DB_USER and DB_PASSWORD in .env');
    }
    
    process.exit(1);
  }
};

const main = async () => {
  try {
    await checkDatabase();
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { checkDatabase };