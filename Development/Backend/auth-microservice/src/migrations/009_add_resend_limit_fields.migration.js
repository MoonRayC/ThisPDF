module.exports = {
  version: 9,
  name: 'add_resend_limit_fields',
  up: `
    ALTER TABLE email_verification_tokens
    ADD COLUMN resend_count INTEGER DEFAULT 0,
    ADD COLUMN last_sent_at TIMESTAMP DEFAULT NOW();

    ALTER TABLE password_resets
    ADD COLUMN resend_count INTEGER DEFAULT 0,
    ADD COLUMN last_sent_at TIMESTAMP DEFAULT NOW();
  `,
  down: `
    ALTER TABLE email_verification_tokens
    DROP COLUMN IF EXISTS resend_count,
    DROP COLUMN IF EXISTS last_sent_at;

    ALTER TABLE password_resets
    DROP COLUMN IF EXISTS resend_count,
    DROP COLUMN IF EXISTS last_sent_at;
  `
};
