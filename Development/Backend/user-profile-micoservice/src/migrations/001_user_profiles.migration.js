const up = async (pool) => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE,
      username VARCHAR(50) NOT NULL UNIQUE,
      bio TEXT,
      avatar_url VARCHAR(500),
      last_active_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at);

    -- Create trigger to update updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_user_profiles_updated_at 
        BEFORE UPDATE ON user_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    await pool.query(query);
    console.log('✅ Created user_profiles table with indexes and trigger');
  } catch (error) {
    console.error('❌ Error creating user_profiles table:', error);
    throw error;
  }
};

const down = async (pool) => {
  const query = `
    DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
    DROP FUNCTION IF EXISTS update_updated_at_column();
    DROP INDEX IF EXISTS idx_user_profiles_last_active;
    DROP INDEX IF EXISTS idx_user_profiles_username;
    DROP INDEX IF EXISTS idx_user_profiles_user_id;
    DROP TABLE IF EXISTS user_profiles;
  `;

  try {
    await pool.query(query);
    console.log('✅ Dropped user_profiles table with indexes and trigger');
  } catch (error) {
    console.error('❌ Error dropping user_profiles table:', error);
    throw error;
  }
};

module.exports = { up, down };