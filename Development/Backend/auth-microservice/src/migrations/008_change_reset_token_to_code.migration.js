module.exports = {
  version: 8,
  name: 'change_reset_token_to_code',
  up: `
    ALTER TABLE password_resets 
    ALTER COLUMN reset_token TYPE VARCHAR(6);

    -- Optional: add constraint to ensure it's 6 digits
    ALTER TABLE password_resets 
    ADD CONSTRAINT reset_token_6_digit CHECK (reset_token ~ '^[0-9]{6}$');
  `,
  down: `
    -- Roll back to previous TEXT type and drop constraint
    ALTER TABLE password_resets 
    DROP CONSTRAINT IF EXISTS reset_token_6_digit;

    ALTER TABLE password_resets 
    ALTER COLUMN reset_token TYPE TEXT;
  `
};
