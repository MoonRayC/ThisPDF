module.exports = {
  version: 7,
  name: 'change_verification_token_to_code',
  up: `
    ALTER TABLE email_verification_tokens 
    ALTER COLUMN verification_token TYPE VARCHAR(6);

    -- Optional: Clean old long tokens if needed
    DELETE FROM email_verification_tokens WHERE LENGTH(verification_token) > 6;
  `,
  down: `
    ALTER TABLE email_verification_tokens 
    ALTER COLUMN verification_token TYPE TEXT;
  `
};
