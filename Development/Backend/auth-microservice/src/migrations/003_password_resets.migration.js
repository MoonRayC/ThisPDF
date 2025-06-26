module.exports = {
    version: 3,
    name: 'create_password_resets_table',
    up: `
      CREATE TABLE password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reset_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
      CREATE INDEX idx_password_resets_token ON password_resets(reset_token);
      CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
    `,
    down: `DROP TABLE IF EXISTS password_resets;`
};