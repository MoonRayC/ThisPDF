const { query } = require('../config/database');

const up = async () => {
  console.log('Creating metadata table...');
  
  await query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS metadata (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      file_id VARCHAR(255) UNIQUE NOT NULL,
      file_url TEXT,
      image_url TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tags TEXT[], -- PostgreSQL array type for tags
      category VARCHAR(100),
      subcategory VARCHAR(100),
      pages INTEGER CHECK (pages > 0),
      size_kb INTEGER CHECK (size_kb > 0),
      visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
      uploader_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for better performance
  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_uploader_id ON metadata(uploader_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_file_id ON metadata(file_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_category ON metadata(category);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_visibility ON metadata(visibility);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_tags ON metadata USING GIN(tags);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_metadata_created_at ON metadata(created_at);
  `);

  // Create trigger to automatically update updated_at
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await query(`
    CREATE TRIGGER update_metadata_updated_at 
    BEFORE UPDATE ON metadata 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  `);

  console.log('Metadata table created successfully!');
};

const down = async () => {
  console.log('Dropping metadata table...');
  
  await query(`DROP TRIGGER IF EXISTS update_metadata_updated_at ON metadata;`);
  await query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
  await query(`DROP TABLE IF EXISTS metadata CASCADE;`);
  
  console.log('Metadata table dropped successfully!');
};

module.exports = {
  up,
  down,
};