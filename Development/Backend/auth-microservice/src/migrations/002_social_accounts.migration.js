module.exports = {
  version: 2,
  name: 'create_social_accounts_table',
  up: `
      CREATE TABLE social_accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_uid TEXT NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(provider, provider_uid)
      );

      CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
      CREATE INDEX idx_social_accounts_provider ON social_accounts(provider);
    `,
  down: `DROP TABLE IF EXISTS social_accounts;`
};