module.exports = {
  version: 1,
  name: 'create_users_table',
  up: `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      is_email_verified BOOLEAN DEFAULT FALSE,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP
    );
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_deleted_at ON users(deleted_at);
  `,
  down: `DROP TABLE IF EXISTS users;`
};