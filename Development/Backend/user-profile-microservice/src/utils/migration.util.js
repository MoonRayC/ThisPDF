const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

class MigrationUtil {
  static async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await pool.query(query);
      console.log('📁 Migrations table created or verified');
    } catch (error) {
      console.error('❌ Error creating migrations table:', error);
      throw error;
    }
  }

  static async getExecutedMigrations() {
    try {
      const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
      return result.rows.map(row => row.filename);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      throw error;
    }
  }

  static async recordMigration(filename) {
    try {
      await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
      console.log(`✅ Recorded migration: ${filename}`);
    } catch (error) {
      console.error(`❌ Error recording migration ${filename}:`, error);
      throw error;
    }
  }

  static async removeMigrationRecord(filename) {
    try {
      await pool.query('DELETE FROM migrations WHERE filename = $1', [filename]);
      console.log(`✅ Removed migration record: ${filename}`);
    } catch (error) {
      console.error(`❌ Error removing migration record ${filename}:`, error);
      throw error;
    }
  }

  static getPendingMigrations(allFiles, executedFiles) {
    return allFiles.filter(file => !executedFiles.includes(file));
  }

  static getMigrationFiles() {
    const migrationsDir = path.join(__dirname, '../migrations');
    try {
      return fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.migration.js'))
        .sort();
    } catch (error) {
      console.error('❌ Error reading migrations directory:', error);
      return [];
    }
  }

  static async executeMigration(filename, direction = 'up') {
    const migrationPath = path.join(__dirname, '../migrations', filename);
    
    try {
      const migration = require(migrationPath);
      
      if (direction === 'up' && typeof migration.up === 'function') {
        await migration.up(pool);
        console.log(`⬆️  Executed migration UP: ${filename}`);
      } else if (direction === 'down' && typeof migration.down === 'function') {
        await migration.down(pool);
        console.log(`⬇️  Executed migration DOWN: ${filename}`);
      } else {
        throw new Error(`Migration ${filename} does not have a valid ${direction} function`);
      }
    } catch (error) {
      console.error(`❌ Error executing migration ${filename}:`, error);
      throw error;
    }
  }
}

module.exports = MigrationUtil;