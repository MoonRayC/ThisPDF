module.exports = {
    version: 4,
    name: 'create_email_verification_tokens_table',
    up: `
      CREATE TABLE email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        verification_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
      CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(verification_token);
      CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
    `,
    down: `DROP TABLE IF EXISTS email_verification_tokens;`
};